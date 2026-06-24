import 'server-only';
import { Sandbox } from '@vercel/sandbox';

import { type BundleFile, contentTypeFor } from './build-bundle';

// build-bundle の本番版。Vercel のデプロイ Node ランタイムではテンプレの vite build を回せない
// （node_modules を抱えられない/重い）ため、テンプレ＋依存を焼いた snapshot から microVM を
// 起こして本物の vite build を実行し、出力（自己完結の静的バンドル）を Buffer 配列で返す。
// 認証はデプロイ内では OIDC（VERCEL_OIDC_TOKEN）が自動で効く。ビルド専用で常駐させない。

const SNAPSHOT_ID = process.env['AI_TEMPLATE_SNAPSHOT_ID'] ?? '';
// snapshot は /vercel/sandbox にテンプレを展開して焼く（bake スクリプトと合わせる）。
const WORKDIR = '/vercel/sandbox';
const SESSION_TIMEOUT_MS = 5 * 60 * 1000;
const BUILD_TIMEOUT_MS = 4 * 60 * 1000;

export const isSandboxBuildConfigured = (): boolean => SNAPSHOT_ID !== '';

export const buildInSandbox = async (code: string): Promise<BundleFile[]> => {
  if (SNAPSHOT_ID === '') {
    throw new Error(
      'AI_TEMPLATE_SNAPSHOT_ID が未設定です（snapshot を bake してください）',
    );
  }
  // snapshot ソース指定時は runtime を渡さない（snapshot から継承される）。
  const sandbox = await Sandbox.create({
    source: { type: 'snapshot', snapshotId: SNAPSHOT_ID },
    timeout: SESSION_TIMEOUT_MS,
  });
  try {
    await sandbox.writeFiles([
      { path: 'src/generated/Preview.tsx', content: code },
    ]);
    // base=./ で相対パス化し、任意の配信パス（/preview や /s 配下）で動くようにする。
    const build = await sandbox.runCommand({
      cmd: 'npm',
      args: ['run', 'build', '--', '--base=./'],
      cwd: WORKDIR,
      timeoutMs: BUILD_TIMEOUT_MS,
    });
    if (build.exitCode !== 0) {
      // 生成コードのビルドエラー等。末尾を自己修復ループ/ユーザー提示に回す。
      const stderr = await build.stderr();
      throw new Error(
        `sandbox vite build failed (exit ${build.exitCode.toString()}): ${stderr.slice(-2000)}`,
      );
    }
    const listed = await sandbox.runCommand({
      cmd: 'find',
      args: ['dist', '-type', 'f'],
      cwd: WORKDIR,
    });
    const rels = (await listed.stdout())
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => line.replace(/^(\.\/)?dist\//u, ''));
    return await Promise.all(
      rels.map(async (rel) => {
        const body = await sandbox.readFileToBuffer({
          path: `dist/${rel}`,
          cwd: WORKDIR,
        });
        if (body === null) {
          throw new Error(`build 出力が読めません: ${rel}`);
        }
        return { path: rel, body, contentType: contentTypeFor(rel) };
      }),
    );
  } finally {
    await sandbox.stop().catch(() => undefined);
  }
};
