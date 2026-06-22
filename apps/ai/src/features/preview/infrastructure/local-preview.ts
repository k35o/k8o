import 'server-only';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

// ローカル開発用プレビュー: sandbox-template の Vite dev server を手元で動かし、
// 生成コードを generated/Preview.tsx に書き込む。HMR/再読込でプレビューが更新される。
// 本番では同じ provider インターフェースを Vercel Sandbox 実装に差し替える。

const PORT = 5199;
const PREVIEW_URL =
  process.env['AI_LOCAL_PREVIEW_URL'] ?? `http://localhost:${PORT}`;
const TEMPLATE_DIR = path.resolve(process.cwd(), 'sandbox-template');
const GENERATED_FILE = path.join(
  TEMPLATE_DIR,
  'src',
  'generated',
  'Preview.tsx',
);

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const isAlive = async (): Promise<boolean> => {
  try {
    await fetch(PREVIEW_URL, { signal: AbortSignal.timeout(800) });
    return true;
  } catch {
    return false;
  }
};

let spawned = false;
const spawnServer = (): void => {
  if (spawned) {
    return;
  }
  spawned = true;
  // ベストエフォートで Vite を起動（既に動いていれば isAlive で再利用される）。
  const child = spawn(
    'npm',
    ['--prefix', TEMPLATE_DIR, 'run', 'dev', '--', '--port', String(PORT)],
    { stdio: 'ignore', detached: false },
  );
  child.unref();
};

export const ensureLocalPreview = async (): Promise<string> => {
  if (await isAlive()) {
    return PREVIEW_URL;
  }
  spawnServer();
  for (let i = 0; i < 20; i += 1) {
    // eslint-disable-next-line no-await-in-loop -- 起動待ちのポーリング
    if (await isAlive()) {
      return PREVIEW_URL;
    }
    // eslint-disable-next-line no-await-in-loop -- 起動待ちのポーリング
    await sleep(500);
  }
  return PREVIEW_URL;
};

export const writeLocalPreview = async (code: string): Promise<void> => {
  await mkdir(path.dirname(GENERATED_FILE), { recursive: true });
  await writeFile(GENERATED_FILE, code, 'utf8');
};
