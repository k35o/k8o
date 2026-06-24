import 'server-only';
import { Sandbox } from '@vercel/sandbox';

import {
  SANDBOX_PROJECT_ID,
  SANDBOX_TEAM_ID,
  SANDBOX_WORKDIR,
} from './sandbox-config';
import { templateSnapshot } from './template-snapshot';

// 本番プレビュー: 焼いた snapshot から名前付き microVM を起こして vite dev を立て、その
// *.vercel.run ドメインを iframe に出す。デプロイ内では OIDC で自動認証。ローカル検証時は
// VERCEL_TOKEN があれば明示認証する（無ければ OIDC を使う＝デプロイ）。コスト抑制のため
// 1 vCPU・短い idle timeout で、用が済めば自動停止（停止中は課金されない）。

// snapshot ID は template-snapshot.ts（bake が自動生成・コミット管理）を正とする。
// env はローカルでの一時上書き用。これでテンプレ↔snapshot の対応がデプロイと常に一致する。
const SNAPSHOT_ID =
  process.env['AI_TEMPLATE_SNAPSHOT_ID'] ?? templateSnapshot.snapshotId;
const PORT = 5173;
const TIMEOUT_MS = 5 * 60 * 1000;
const READY_TRIES = 40;

// デプロイ内は OIDC（VERCEL_OIDC_TOKEN）が自動で効くため creds 不要。ローカルでは
// VERCEL_TOKEN を明示渡し（team/project は公開ID）。
const creds = ():
  | { token: string; teamId: string; projectId: string }
  | object => {
  // VERCEL_TOKEN の有無（存在チェック）。秘密の比較ではない。
  const token = process.env['VERCEL_TOKEN'];
  if (token === undefined || token.length === 0) {
    return {};
  }
  return { token, teamId: SANDBOX_TEAM_ID, projectId: SANDBOX_PROJECT_ID };
};

const isServing = async (url: string): Promise<boolean> => {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(2500) });
    return res.ok;
  } catch {
    return false;
  }
};

// 名前付きサンドボックスを get（あれば再開）するか、無ければ snapshot から作る。
const getOrCreate = async (name: string): Promise<Sandbox> => {
  if (SNAPSHOT_ID === '') {
    throw new Error(
      'AI_TEMPLATE_SNAPSHOT_ID が未設定です（snapshot を bake してください）',
    );
  }
  const existing = await Sandbox.get({ name, ...creds() }).catch(() => null);
  if (existing !== null) {
    return existing;
  }
  // snapshot ソース指定時は runtime を渡さない（snapshot から継承）。
  return Sandbox.create({
    name,
    source: { type: 'snapshot', snapshotId: SNAPSHOT_ID },
    ports: [PORT],
    resources: { vcpus: 1 },
    timeout: TIMEOUT_MS,
    ...creds(),
  });
};

// vite dev が応答していなければ起動し、応答するまで待ってから domain を返す。
const ensureServing = async (sandbox: Sandbox): Promise<string> => {
  const url = sandbox.domain(PORT);
  if (await isServing(url)) {
    return url;
  }
  await sandbox.runCommand({
    cmd: 'npm',
    args: ['run', 'dev', '--', '--port', String(PORT), '--host'],
    cwd: SANDBOX_WORKDIR,
    detached: true,
  });
  for (let i = 0; i < READY_TRIES; i += 1) {
    // eslint-disable-next-line no-await-in-loop -- 起動待ちのポーリング
    if (await isServing(url)) {
      return url;
    }
    // eslint-disable-next-line no-await-in-loop -- 起動待ちのポーリング
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
  }
  return url;
};

// プレビュー用サンドボックスを用意して配信URLを返す（コード未指定。apply で差し替える）。
export const ensureSandboxPreview = async (name: string): Promise<string> => {
  const sandbox = await getOrCreate(name);
  return ensureServing(sandbox);
};

// 名前付きサンドボックスにコードを書き込み、配信が立っていることを確保して URL を返す。
export const serveSandboxPreview = async (
  name: string,
  code: string,
): Promise<string> => {
  const sandbox = await getOrCreate(name);
  await sandbox.writeFiles([
    { path: 'src/generated/Preview.tsx', content: code },
  ]);
  return ensureServing(sandbox);
};

// 生成コードを書き込む（HMR で反映）。停止していれば起こして配信を確保する。
export const writeSandboxPreview = async (
  name: string,
  code: string,
): Promise<void> => {
  await serveSandboxPreview(name, code);
};

// 名前付きサンドボックスを停止する（非公開化時の後始末。ベストエフォート）。
export const stopSandboxPreview = async (name: string): Promise<void> => {
  const sandbox = await Sandbox.get({ name, ...creds() }).catch(() => null);
  if (sandbox !== null) {
    await sandbox.stop().catch(() => undefined);
  }
};
