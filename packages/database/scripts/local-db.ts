// ローカル開発用 turso(libSQL) を起動するスクリプト。
//
// pnpm dev から呼ばれ、DB が動いていなければ起動・動いていれば再利用する。
// db.k8o.localhost を固定ルート化し、全 worktree が main checkout の
// 同じ local.db を共有する。
//
// 使い方:
//   node scripts/local-db.ts serve    # alias 登録 + turso をフォアグラウンド起動（起動済みなら何もしない）
//   node scripts/local-db.ts status   # 稼働状況の確認
//
// 停止は serve を実行しているプロセスに Ctrl-C / SIGTERM。

import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { connect } from 'node:net';
import { join } from 'node:path';

const PORT = Number(process.env['K8O_DB_PORT'] ?? '38787');
const SCRIPT_DIR = import.meta.dirname;

const log = (message: string): void => {
  console.error(`>> ${message}`);
};

// worktree list の先頭が main working tree。共有 DB はそこの local.db に固定する
const resolveMainRoot = (): string => {
  const out = spawnSync('git', ['-C', SCRIPT_DIR, 'worktree', 'list'], {
    encoding: 'utf8',
  });
  const firstLine = out.stdout.split('\n')[0] ?? '';
  return firstLine.split(/\s+/u)[0] ?? '';
};

const MAIN_ROOT = resolveMainRoot();
const DB_FILE = join(MAIN_ROOT, 'packages/database/local.db');
const PORTLESS = join(MAIN_ROOT, 'node_modules/.bin/portless');

const resolveTurso = (): string | null => {
  const mise = spawnSync('mise', ['which', 'turso'], { encoding: 'utf8' });
  if (mise.status === 0 && mise.stdout.trim() !== '') {
    return mise.stdout.trim();
  }
  const which = spawnSync('which', ['turso'], { encoding: 'utf8' });
  if (which.status === 0 && which.stdout.trim() !== '') {
    return which.stdout.trim();
  }
  return null;
};

const isPortInUse = (port: number): Promise<boolean> =>
  new Promise((resolve) => {
    const socket = connect({ host: '127.0.0.1', port });
    socket.setTimeout(500);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      resolve(false);
    });
  });

const registerAlias = (): void => {
  if (!existsSync(PORTLESS)) {
    log(`portless が見つからないため alias 登録をスキップ: ${PORTLESS}`);
    return;
  }
  const result = spawnSync(
    PORTLESS,
    ['alias', 'db.k8o', String(PORT), '--force'],
    { stdio: 'inherit' },
  );
  if (result.status !== 0) {
    log(
      'portless alias 登録に失敗（proxy 未起動かも。pnpm dev 後に再実行で OK）',
    );
  }
};

const serve = async (): Promise<void> => {
  const turso = resolveTurso();
  if (turso === null) {
    log('turso が見つかりません (mise which turso / which turso 失敗)');
    process.exit(1);
  }

  if (await isPortInUse(PORT)) {
    log(`ポート ${PORT} は使用中。既存の DB を再利用します。`);
    return;
  }

  registerAlias();

  log(`turso 起動: ${DB_FILE} (port ${PORT}) — 停止は Ctrl-C`);
  const child = spawn(
    turso,
    ['dev', '--db-file', DB_FILE, '--port', String(PORT)],
    {
      stdio: 'inherit',
    },
  );

  const forward = (signal: NodeJS.Signals): void => {
    child.kill(signal);
  };
  process.on('SIGINT', forward);
  process.on('SIGTERM', forward);
  child.on('exit', (code) => {
    process.exit(code ?? 0);
  });
};

const status = async (): Promise<void> => {
  const inUse = await isPortInUse(PORT);
  log(
    `ポート ${PORT}: ${inUse ? '使用中（DB 稼働）' : 'リスナーなし（DB 未起動）'}`,
  );
  if (existsSync(PORTLESS)) {
    spawnSync(PORTLESS, ['list'], { stdio: 'inherit' });
  }
};

const main = async (): Promise<void> => {
  switch (process.argv[2]) {
    case 'serve':
      await serve();
      break;
    case 'status':
      await status();
      break;
    default:
      console.error('Usage: node scripts/local-db.ts {serve|status}');
      process.exit(1);
  }
};

await main();
