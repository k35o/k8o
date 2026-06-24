import 'server-only';
import { spawn } from 'node:child_process';
import {
  cp,
  mkdtemp,
  readdir,
  readFile,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const TEMPLATE_DIR = path.resolve(process.cwd(), 'sandbox-template');

export type BundleFile = {
  // バンドル内の相対パス。区切りは常に '/'。
  path: string;
  body: Buffer;
  contentType: string;
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

export const contentTypeFor = (filePath: string): string =>
  CONTENT_TYPES[path.extname(filePath)] ?? 'application/octet-stream';

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
      reject(
        new Error(
          `vite build failed (exit ${code ?? 'null'}): ${stderr.slice(-2000)}`,
        ),
      );
    });
  });

const collectBuildOutput = async (outDir: string): Promise<BundleFile[]> => {
  const entries = await readdir(outDir, {
    recursive: true,
    withFileTypes: true,
  });
  return Promise.all(
    entries
      .filter((entry) => entry.isFile())
      .map(async (entry) => {
        const abs = path.join(entry.parentPath, entry.name);
        const rel = path.relative(outDir, abs).split(path.sep).join('/');
        return {
          path: rel,
          body: await readFile(abs),
          contentType: contentTypeFor(rel),
        };
      }),
  );
};

export const buildBundle = async (code: string): Promise<BundleFile[]> => {
  const buildDir = await mkdtemp(path.join(tmpdir(), 'k8o-build-'));
  const outDir = await mkdtemp(path.join(tmpdir(), 'k8o-out-'));
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
    // node_modules はコピーが重いのでテンプレートのものを symlink で共有。
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
    await runViteBuild(buildDir, outDir);
    return await collectBuildOutput(outDir);
  } finally {
    await rm(buildDir, { recursive: true, force: true });
    await rm(outDir, { recursive: true, force: true });
  }
};
