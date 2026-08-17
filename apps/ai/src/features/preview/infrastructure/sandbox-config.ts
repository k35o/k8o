// Vercel Sandbox の接続先（team/project は公開ID。秘密ではない）と起動イメージ。
// sandbox-preview.ts と bake スクリプト(.mjs)の両方が参照する単一ソース。
// bake から import するため 'server-only' は付けない。
export const SANDBOX_TEAM_ID = 'team_K1poAqb11IhJpOHw17Z5qhvC';
export const SANDBOX_PROJECT_ID = 'prj_Iz1SHi1C6rgwFz2YngTzeiRdsFE8';
// Vercel managed image。node:24 は npm/pnpm 入りの Ubuntu ベースで、テンプレの
// npm ci + vite dev に必要なものが揃っている（universal は coding agents 等まで含み過剰）。
export const SANDBOX_IMAGE = 'vercel/sandbox/node:24';
