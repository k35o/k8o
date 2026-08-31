# apps/ai CLAUDE.md

AI関連ツールの置き場（`ai.k8o.me`）。第1号は @k8ordo/ui × Sakana Fugu の v0風デザインシステム壁打ちツール。

## レイヤー構成（src/）

apps/main と同じ `app / features / shared` 構成（詳細は `apps/main/CLAUDE.md`）。Server Actions（`'use server'`）は `features/*/interface` に置く。`_actions` は新規作成しない。

- `generation/` - Sakana Fugu（OpenAI互換, AI SDK v7）による json-render spec 生成（レート制限もここ）
- `share/` - 公開共有（公開/非公開化。/s/[slug] は DB の spec をその場で描画）
- `projects/` - プロジェクト・版の永続化（@repo/database）
- `highlight/` - 生成物（spec JSON / スライド）の shiki ハイライト

## 生成 UI（json-render）

UI スタジオの生成物は TSX ではなく json-render の spec。catalog・registry・検証は
`@k8ordo/ui/json-render`（公式アダプタ）を使い、独自の catalog は作らない。

- system prompt は `catalog.prompt({ mode: 'inline', ... })`（`build-spec-system-prompt.ts`）。
  inline モードなので assistant の出力は「会話文 → JSONL パッチ」の混在ストリーム
- サーバは `pipeJsonRender`（@json-render/core）でパッチ行を `data-spec` パーツへ分離し、
  クライアントは `specFromMessage`（`spec-message.ts`）で土台 spec へ逐次適用して描画する
- 描画は `JsonRenderUI`（`app/_components/spec-preview`）。iframe や Sandbox は無い
- 完了時は `validateGeneratedSpec` で検証し、失敗時は repairPrompt を次ターンの system に流す

## 認証 & コスト保護

Better Auth + GitHub OAuth（`@repo/database/auth` を共用）。**本人のみ**利用可（`ALLOWED_EMAILS`）。

LLM / サンドボックスは課金が発生するため、**課金が発生する全 API route / server action の先頭で `shared/auth/require-allowed-session.ts` を呼び、未許可は 401 で弾く**こと（middleware は `/api` を守らないため必須の防御層）。

認証の実装は admin と共有で `@repo/auth-shell`（`packages/auth-shell/CLAUDE.md`）にある。認証まわりを直すときはそちらを直し、ai 側にコピーを作らない。認証の有効/無効は `@repo/auth-shell/auth-enabled` に集約。Vercel preview は認証OFF（= preview URL は課金の開き戸になるため、ai プロジェクトには Vercel Deployment Protection を併用する）。

ローカル開発URLは `https://ai.k8o.localhost/`。`LOCAL_AUTH_BYPASS=true`（`.env.local`, NODE_ENV=development のときのみ）でログインを省略できる。

## Storybook MCP

ai 用 Storybook MCP は今後登録予定。それまでは `apps/ai/node_modules/@k8o/arte-odyssey/docs/` を参照（propsを推測で使わない方針はルートのCLAUDE.md「UI共通」どおり）。

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
