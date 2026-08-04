# apps/ai CLAUDE.md

AI関連ツールの置き場（`ai.k8o.me`）。第1号は arte-odyssey × Sakana Fugu の v0風デザインシステム壁打ちツール。

## レイヤー構成（src/）

apps/main と同じ `app / features / shared` 構成（詳細は `apps/main/CLAUDE.md`）。Server Actions（`'use server'`）は `features/*/interface` に置く。`_actions` は新規作成しない。

- `generation/` - Sakana Fugu（OpenAI互換, AI SDK v7）による TSX 生成（レート制限もここ）
- `preview/` - 編集中のライブプレビュー（ローカルも本番も Vercel Sandbox に一本化）
- `share/` - 公開共有（公開/Sandbox 配信/非公開化）
- `projects/` - プロジェクト・版の永続化（@repo/database）
- `highlight/` - 生成コードの shiki ハイライト
- Vercel Sandbox の起動/配信は `preview/infrastructure/sandbox-preview.ts` に集約し、share は `preview/application/sandbox-runtime.ts`（公開境界）経由で利用する

## 認証 & コスト保護

Better Auth + GitHub OAuth（`@repo/database/auth` を共用）。**本人のみ**利用可（`ALLOWED_EMAILS`）。

LLM / サンドボックスは課金が発生するため、**課金が発生する全 API route / server action の先頭で `shared/auth/require-allowed-session.ts` を呼び、未許可は 401 で弾く**こと（middleware は `/api` を守らないため必須の防御層）。

認証の有効/無効は `src/shared/auth/auth-enabled.ts` に集約。Vercel preview は認証OFF（= preview URL は課金の開き戸になるため、ai プロジェクトには Vercel Deployment Protection を併用する）。

ローカル開発URLは `https://ai.k8o.localhost/`。`LOCAL_AUTH_BYPASS=true`（`.env.local`, NODE_ENV=development のときのみ）でログインを省略できる。

## Storybook MCP

ai 用 Storybook MCP は今後登録予定。それまでは `apps/ai/node_modules/@k8o/arte-odyssey/docs/` を参照（propsを推測で使わない方針はルートのCLAUDE.md「UI共通」どおり）。

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
