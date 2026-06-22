import 'server-only';
import { spawn } from 'node:child_process';
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
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

const runViteBuild = (cwd: string, outDir: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const bin = path.join(cwd, 'node_modules', '.bin', 'vite');
    const child = spawn(
      bin,
      ['build', '--base=./', '--outDir', outDir, '--emptyOutDir'],
      { cwd, stdio: 'ignore' },
    );
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`vite build failed (exit ${code ?? 'null'})`));
    });
  });

export const buildSharedBundle = async (
  slug: string,
  code: string,
): Promise<void> => {
  const buildDir = await mkdtemp(path.join(tmpdir(), 'k8o-share-'));
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
    await mkdir(SHARED_ROOT, { recursive: true });
    await runViteBuild(buildDir, path.join(SHARED_ROOT, slug));
  } finally {
    await rm(buildDir, { recursive: true, force: true });
  }
};

export const removeSharedBundle = async (slug: string): Promise<void> => {
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

// ビルド済みアセットを読み出す。slug 配下から出ない（path traversal を防ぐ）よう正規化して検証する。
export const readSharedAsset = async (
  slug: string,
  segments: readonly string[],
): Promise<{ body: Buffer; contentType: string } | null> => {
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
