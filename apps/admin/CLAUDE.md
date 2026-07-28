# apps/admin CLAUDE.md

管理サイト。Better Auth + GitHub OAuth で認証する。

## レイヤー構成（src/）

apps/main と同じ `app / features / shared` 構成（詳細は `apps/main/CLAUDE.md`）。Server Actions（`'use server'`）は `features/*/interface` に置く。`_actions` は新規作成しない。

Next.jsの機能やAPIは `apps/admin/node_modules/next/dist/docs/` のバンドルドキュメントを参照すること。

## Storybook MCP

apps/admin のStorybook MCPは `admin-storybook-mcp`。propsの確認手順はルートのCLAUDE.md「UI共通」を参照。

## 認証

ローカル開発URL は `https://admin.k8o.localhost/`。

認証の有効/無効は `src/shared/auth/auth-enabled.ts` の `isAuthEnabled` に集約し、`proxy.ts`（middleware）と `verify-session.ts` の両方が参照する。

- Vercel preview は認証OFF
- ローカル開発で `LOCAL_AUTH_BYPASS=true`（`.env.local`）を設定するとログインを省略できる。`NODE_ENV=development` のときだけ評価するため、本番では無視され bypass は起こらない
- 実際にローカルでGitHubログインを検証したいときは `LOCAL_AUTH_BYPASS` を外す（その場合は GitHub OAuth アプリのコールバックを `https://admin.k8o.localhost/api/auth/callback/github` に設定）

設定や運用上の注意は Better Auth のスキル（`better-auth-best-practices` / `better-auth-security-best-practices`）を参照すること。
