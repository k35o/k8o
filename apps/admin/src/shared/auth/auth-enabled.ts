// 認証を有効にするかどうかの単一判定。proxy(middleware) と verifySession の
// 両方がこれを参照し、ロジックのドリフトを防ぐ。
//
// - Vercel preview: 認証OFF（既存挙動）
// - ローカル開発 かつ LOCAL_AUTH_BYPASS=true: 認証OFF（ログインを省略）
//
// LOCAL_AUTH_BYPASS は NODE_ENV=development のときだけ評価する。本番
// (NODE_ENV=production) では無視されるため、bypass は構造的に起こり得ない。
const isLocalAuthBypass =
  process.env['NODE_ENV'] === 'development' &&
  process.env['LOCAL_AUTH_BYPASS'] === 'true';

export const isAuthEnabled =
  process.env['VERCEL_ENV'] !== 'preview' && !isLocalAuthBypass;
