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

// snapshot 由来の短いタグ。sandbox 名に付けることで、snapshot が変わると名前も変わり、
// 旧 snapshot で作った sandbox を get で再利用しなくなる（= テンプレ更新が即プレビューに反映）。
const SNAPSHOT_TAG = SNAPSHOT_ID.replaceAll(/[^a-z0-9]/giu, '')
  .slice(-12)
  .toLowerCase();
const named = (name: string): string => `${name}-${SNAPSHOT_TAG}`;

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

// warm インスタンス内で Sandbox ハンドルと「配信確認済み」時刻を fullName 単位でキャッシュし、
// apply のたびに走る Sandbox.get / isServing の往復を省く（studio / share で別キー）。
// 停止・失効時は操作失敗で破棄して取り直すため、staleness は writeFiles の retry が吸収する。
const handleCache = new Map<string, Sandbox>();
const servingConfirmedAt = new Map<string, number>();
const SERVING_TTL_MS = 30 * 1000;

const dropCache = (fullName: string): void => {
  handleCache.delete(fullName);
  servingConfirmedAt.delete(fullName);
};

// 名前付きサンドボックスを get（あれば再開）するか、無ければ snapshot から作る。
// ハンドルはキャッシュして、連続 apply での Sandbox.get 往復を避ける。
const getOrCreate = async (name: string): Promise<Sandbox> => {
  if (SNAPSHOT_ID === '') {
    throw new Error(
      'AI_TEMPLATE_SNAPSHOT_ID が未設定です（snapshot を bake してください）',
    );
  }
  const fullName = named(name);
  const cached = handleCache.get(fullName);
  if (cached !== undefined) {
    return cached;
  }
  const existing = await Sandbox.get({ name: fullName, ...creds() }).catch(
    () => null,
  );
  // snapshot ソース指定時は runtime を渡さない（snapshot から継承）。
  const sandbox =
    existing ??
    (await Sandbox.create({
      name: fullName,
      source: { type: 'snapshot', snapshotId: SNAPSHOT_ID },
      ports: [PORT],
      resources: { vcpus: 1 },
      timeout: TIMEOUT_MS,
      ...creds(),
    }));
  handleCache.set(fullName, sandbox);
  return sandbox;
};

// vite dev が応答していなければ起動し、応答するまで待ってから domain を返す。
// trustCache=true かつ直近で配信確認済みなら、apply ごとの確認 fetch を省く。
const ensureServing = async (
  sandbox: Sandbox,
  fullName: string,
  trustCache: boolean,
): Promise<string> => {
  const url = sandbox.domain(PORT);
  const confirmedAt = servingConfirmedAt.get(fullName) ?? 0;
  if (trustCache && Date.now() - confirmedAt < SERVING_TTL_MS) {
    return url;
  }
  if (await isServing(url)) {
    servingConfirmedAt.set(fullName, Date.now());
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
      servingConfirmedAt.set(fullName, Date.now());
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
// cold start の確認なのでキャッシュは信頼しない。
export const ensureSandboxPreview = async (name: string): Promise<string> => {
  const sandbox = await getOrCreate(name);
  return ensureServing(sandbox, named(name), false);
};

// 名前付きサンドボックスにコードを書き込み、配信が立っていることを確保して URL を返す。
export const serveSandboxPreview = async (
  name: string,
  code: string,
): Promise<string> => {
  const fullName = named(name);
  const files = [{ path: 'src/generated/Preview.tsx', content: code }];
  let sandbox = await getOrCreate(name);
  try {
    await sandbox.writeFiles(files);
  } catch {
    // キャッシュした handle が失効していた場合は取り直して一度だけ再試行する。
    dropCache(fullName);
    sandbox = await getOrCreate(name);
    await sandbox.writeFiles(files);
  }
  return ensureServing(sandbox, fullName, true);
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
  const fullName = named(name);
  const sandbox = await Sandbox.get({ name: fullName, ...creds() }).catch(
    () => null,
  );
  if (sandbox !== null) {
    await sandbox.stop().catch(() => undefined);
  }
  dropCache(fullName);
};
