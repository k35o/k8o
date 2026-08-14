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

- Vercel preview は認証OFF（= preview URL の防御は Vercel Deployment Protection に依存する。ai と同様に有効化を維持すること。無効化すると preview URL だけで DB 書き込みや push 送信ができてしまう）
- ローカル開発で `LOCAL_AUTH_BYPASS=true`（`.env.local`）を設定するとログインを省略できる。`NODE_ENV=development` のときだけ評価するため、本番では無視され bypass は起こらない
- 実際にローカルでGitHubログインを検証したいときは `LOCAL_AUTH_BYPASS` を外す（その場合は GitHub OAuth アプリのコールバックを `https://admin.k8o.localhost/api/auth/callback/github` に設定）

設定や運用上の注意は Better Auth のスキル（`better-auth-best-practices` / `better-auth-security-best-practices`）を参照すること。

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
