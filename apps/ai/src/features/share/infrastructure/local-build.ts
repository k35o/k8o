import 'server-only';
import { spawn } from 'node:child_process';
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rename,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

// 公開用の「本物ビルド」をローカルで作る実装。sandbox-template を隔離した一時ディレクトリに
// コピーして公開版のコードを差し込み、vite build で自己完結の静的バンドルを生成して
// .ai-shared/<slug>/ に出力する。実行時 eval は使わず、ビルド時にエラーも捕捉できる。
// 本番では同じインターフェースを Vercel Sandbox + 静的ホストの実装に差し替える。

const TEMPLATE_DIR = path.resolve(process.cwd(), 'sandbox-template');
const SHARED_ROOT = path.resolve(process.cwd(), '.ai-shared');

// slug は generateSlug() の 12桁hex のみ許可。配信ルートは未認証で叩けるため、ここで
// 形式を厳格化して path traversal（slug 自体に '..' 等）を入口で封じる。
const SLUG_RE = /^[0-9a-f]{12}$/u;
const isValidSlug = (slug: string): boolean => SLUG_RE.test(slug);

const runViteBuild = (cwd: string, outDir: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const bin = path.join(cwd, 'node_modules', '.bin', 'vite');
    const child = spawn(
      bin,
      ['build', '--base=./', '--outDir', outDir, '--emptyOutDir'],
      { cwd, stdio: ['ignore', 'ignore', 'pipe'] },
    );
    let stderr = '';
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      // 失敗原因（生成コードのビルドエラー等）をサーバログに残す。
      reject(
        new Error(
          `vite build failed (exit ${code ?? 'null'}): ${stderr.slice(-2000)}`,
        ),
      );
    });
  });

export const buildSharedBundle = async (
  slug: string,
  code: string,
): Promise<void> => {
  if (!isValidSlug(slug)) {
    throw new Error('invalid slug');
  }
  const buildDir = await mkdtemp(path.join(tmpdir(), 'k8o-share-'));
  await mkdir(SHARED_ROOT, { recursive: true });
  // 出力は SHARED_ROOT 配下の staging に作り、成功時のみ本ディレクトリへ rename で原子的に
  // 差し替える（再 publish のビルド失敗で配信中のバンドルが壊れないようにする。同一FSなので
  // rename は atomic）。
  const stagingDir = await mkdtemp(path.join(SHARED_ROOT, '.staging-'));
  try {
    // テンプレートのソースだけ隔離コピー（node_modules / dist / .vite は除外）。
    await cp(TEMPLATE_DIR, buildDir, {
      recursive: true,
      filter: (src) => {
        const rel = path.relative(TEMPLATE_DIR, src);
        return (
          !rel.startsWith('node_modules') &&
          !rel.startsWith('dist') &&
          !rel.includes('.vite')
        );
      },
    });
    // node_modules はテンプレートのものを symlink で共有（コピーは重い）。
    await symlink(
      path.join(TEMPLATE_DIR, 'node_modules'),
      path.join(buildDir, 'node_modules'),
      'dir',
    );
    await writeFile(
      path.join(buildDir, 'src', 'generated', 'Preview.tsx'),
      code,
      'utf8',
    );
    await runViteBuild(buildDir, stagingDir);
    const finalDir = path.join(SHARED_ROOT, slug);
    await rm(finalDir, { recursive: true, force: true });
    await rename(stagingDir, finalDir);
  } finally {
    await rm(buildDir, { recursive: true, force: true });
    // rename 成功時は staging は消えている（force で no-op）。失敗時は中間出力を掃除する。
    await rm(stagingDir, { recursive: true, force: true });
  }
};

export const removeSharedBundle = async (slug: string): Promise<void> => {
  if (!isValidSlug(slug)) {
    return;
  }
  await rm(path.join(SHARED_ROOT, slug), { recursive: true, force: true });
};

const CONTENT_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
};

// ビルド済みアセットを読み出す。slug を厳格検証し、target が slug ディレクトリ配下に
// 収まること（path traversal 防止）を SHARED_ROOT 基準で確認する。
export const readSharedAsset = async (
  slug: string,
  segments: readonly string[],
): Promise<{ body: Buffer; contentType: string } | null> => {
  if (!isValidSlug(slug)) {
    return null;
  }
  const base = path.join(SHARED_ROOT, slug);
  const rel = segments.length === 0 ? 'index.html' : path.join(...segments);
  const target = path.normalize(path.join(base, rel));
  if (target !== base && !target.startsWith(base + path.sep)) {
    return null;
  }
  try {
    const body = await readFile(target);
    const contentType =
      CONTENT_TYPES[path.extname(target)] ?? 'application/octet-stream';
    return { body, contentType };
  } catch {
    return null;
  }
};
