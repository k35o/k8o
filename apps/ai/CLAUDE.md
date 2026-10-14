# apps/ai CLAUDE.md

AI関連ツールの置き場（`ai.k8o.me`）。@k8ordo/ui × Claude の v0風デザインシステム壁打ちツール（`/`）と、スライド生成（`/slides`）がある。

## レイヤー構成（src/）

apps/main と同じ `app / features / shared` 構成（詳細は `apps/main/CLAUDE.md`）。Server Actions（`'use server'`）は `features/*/interface` に置く。

- `generation/` - Claude（Sonnet 5.5 / Opus 5.5、AI SDK v7 と @ai-sdk/anthropic）による json-render spec とスライドの生成
- `usage/` - Claude の利用ログ（ai_usages）、1時間あたりの生成回数の上限、月の予算と単価（`pricing.ts`）
- `share/` - 公開共有（公開/非公開化。/s/[slug] は DB の spec をその場で描画）
- `projects/` - プロジェクト・版の永続化（@repo/ai-database）
- `highlight/` - 生成物（spec JSON / spec から変換した TSX / スライド）の shiki ハイライト
- `slides/` - デッキ Markdown のスライド分割とコードブロックの抽出（`parse-deck.ts`）

## 生成 UI（json-render）

UI スタジオの生成物は json-render の spec。コード表示の TSX は `spec-to-tsx.ts` で spec から変換する。catalog・registry・検証は
`@k8ordo/ui/json-render`（公式アダプタ）を使い、独自の catalog は作らない。

- system prompt は `catalog.prompt({ mode: 'inline', ... })`（`build-spec-system-prompt.ts`）。
  inline モードなので assistant の出力は「会話文 → JSONL パッチ」の混在ストリーム
- サーバは `pipeJsonRender`（@json-render/core）でパッチ行を `data-spec` パーツへ分離し、
  クライアントは `specFromMessage`（`spec-message.ts`）で土台 spec へ逐次適用して描画する
- 描画は `JsonRenderUI`（`app/_components/spec-preview`）。アプリと同じドキュメントに描画するので、テーマ・フォントはアプリのものを継承する
- 完了時は `validateGeneratedSpec` で検証し、失敗時は repairPrompt を次ターンの system に流す

## 認証 & コスト保護

Better Auth + GitHub OAuth（`@repo/ai-database/auth`）。**本人のみ**利用可（`ALLOWED_EMAILS`）。

LLM（Claude API）は課金が発生するため、**課金が発生する全 API route / server action の先頭で `shared/auth/require-allowed-session.ts` を呼び、未許可は弾く（API route は 401 を返し、server action は null・空配列・false などを返す）**こと（`src/proxy.ts` は matcher で `/api` を外しているため必須の防御層）。

生成回数の上限（アプリと利用者ごとに1時間あたり `AI_GENERATE_LIMIT_PER_HOUR` 回）と月の予算（UTC の月初からの全行の費用の合計が $100 未満）は `ai_usages` の行で数える。Claude を呼ぶ経路は、呼ぶ前に `reserveUsage`（`usage/application/usage.ts`）で行を予約し、予約できなければ 429 で断る。トークン数と費用は `recordUsage` で、予約した行へあとから書き込む。

認証の実装は `@repo/auth-shell`（`packages/auth-shell/CLAUDE.md`）にある。認証まわりを直すときはそちらを直し、ai 側にコピーを作らない。認証の有効/無効は `@repo/auth-shell/auth-enabled` に集約。Vercel preview は認証OFF（= preview URL は課金の開き戸になるため、ai プロジェクトには Vercel Deployment Protection を併用する）。

ローカル開発URLは `https://ai.k8o.localhost/`。`LOCAL_AUTH_BYPASS=true`（`.env.local`, NODE_ENV=development のときのみ）でログインを省略できる。

## Storybook MCP

ai の Storybook は Chromatic に公開しておらず、`.mcp.json` にも Storybook MCP を登録していない。@k8ordo/ui の props は `apps/ai/node_modules/@k8ordo/ui/docs/` を参照（propsを推測で使わない方針はルートのCLAUDE.md「UI共通」どおり）。

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
