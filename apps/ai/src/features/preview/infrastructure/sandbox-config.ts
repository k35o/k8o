// Vercel Sandbox の接続先（team/project は公開ID。秘密ではない）・起動イメージ・認証。
// sandbox-preview.ts と bake スクリプト(.mjs)の両方が参照する単一ソース。
// bake から import するため 'server-only' は付けない。
export const SANDBOX_TEAM_ID = 'team_K1poAqb11IhJpOHw17Z5qhvC';
export const SANDBOX_PROJECT_ID = 'prj_Iz1SHi1C6rgwFz2YngTzeiRdsFE8';
// Vercel managed image。node:24 は npm/pnpm 入りの Ubuntu ベースで、テンプレの
// npm ci + vite dev に必要なものが揃っている（universal は coding agents 等まで含み過剰）。
export const SANDBOX_IMAGE = 'vercel/sandbox/node:24';

// デプロイ内は OIDC（VERCEL_OIDC_TOKEN）が自動で効くため creds 不要。ローカルでは
// VERCEL_TOKEN を明示渡し（team/project は公開ID）。
// SDK は token / teamId / projectId を「3つ全部か0個か」しか受け付けない。0個なら
// VERCEL_OIDC_TOKEN の JWT から team/project を読むため、明示渡しは不要になる。
export const sandboxCreds = ():
  | { token: string; teamId: string; projectId: string }
  | object => {
  // VERCEL_TOKEN の有無（存在チェック）。秘密の比較ではない。
  const token = process.env['VERCEL_TOKEN'];
  if (token === undefined || token.length === 0) {
    return {};
  }
  return { token, teamId: SANDBOX_TEAM_ID, projectId: SANDBOX_PROJECT_ID };
};
