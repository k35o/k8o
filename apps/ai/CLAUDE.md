# apps/ai CLAUDE.md

AI関連ツールの置き場（`ai.k8o.me`）。@k8ordo/ui × Claude の v0風デザインシステム壁打ちツール（`/`）、スライド生成（`/slides`）、k8o のブログ記事を読めるエージェントとのチャット（`/chat`）がある。

## レイヤー構成（src/）

apps/main と同じ `app / features / shared` 構成（詳細は `apps/main/CLAUDE.md`）。Server Actions（`'use server'`）は `features/*/interface` に置く。

- `generation/` - Claude（Sonnet 5.5 / Opus 5.5、AI SDK v7 と @ai-sdk/anthropic）による json-render spec とスライドの生成
- `agent/` - `/chat` のエージェント。tool つきの生成のループ、スレッドとメッセージの保存（ai_threads・ai_thread_messages）、オーナー API から記事を読む tool
- `usage/` - Claude の利用ログ（ai_usages）、1時間あたりの生成回数の上限、月の予算と単価（`pricing.ts`）
- `share/` - 公開共有（公開/非公開化。/s/[slug] は DB の spec をその場で描画）
- `projects/` - プロジェクト・版の永続化（@repo/ai-database）
- `highlight/` - 生成物（spec JSON / spec から変換した TSX / スライド）の shiki ハイライト
- `slides/` - デッキ Markdown のスライド分割とコードブロックの抽出（`parse-deck.ts`）

`shared/claude/` には、generation・agent・usage が共通で使うモデルの定義（`models.ts`）と provider（`claude-provider.ts`）を置く。

## 生成 UI（json-render）

UI スタジオの生成物は json-render の spec。コード表示の TSX は `spec-to-tsx.ts` で spec から変換する。catalog・registry・検証は
`@k8ordo/ui/json-render`（公式アダプタ）を使い、独自の catalog は作らない。

- system prompt は `catalog.prompt({ mode: 'inline', ... })`（`build-spec-system-prompt.ts`）。
  inline モードなので assistant の出力は「会話文 → JSONL パッチ」の混在ストリーム
- サーバは `pipeJsonRender`（@json-render/core）でパッチ行を `data-spec` パーツへ分離し、
  クライアントは `specFromMessage`（`spec-message.ts`）で土台 spec へ逐次適用して描画する
- 描画は `JsonRenderUI`（`app/_components/spec-preview`）。アプリと同じドキュメントに描画するので、テーマ・フォントはアプリのものを継承する
- 完了時は `validateGeneratedSpec` で検証し、失敗時は repairPrompt を次ターンの system に流す

## エージェント（/chat）

`/chat` は新しいスレッド、`/chat/[threadId]` は既存のスレッドの画面（`app/(authenticated)/chat/`）。サイドバーは `/`・`/slides` の `StudioShell` とは別の `ChatShell` で、ツールのナビ（`ToolNav`）だけを共有する。

- `POST /api/chat` が、`streamText` に tool（`list_blogs`・`read_blog`）を渡してループを回す。ステップ数や時間の上限は `agent/application/agent-run.ts` にある
- スレッドの ID はページが決め、最初の POST が予約を通ったときに、サーバーがスレッドの行を作る
- メッセージは UIMessage を JSON のまま `ai_thread_messages` に追記する。user は実行の開始時、assistant は終了時に1行ずつ書く。終わり方（完了・停止・予算・エラーなど）は assistant の `metadata.end` に残す
- ブラウザが切断しても、生成は最後まで続けて返答を保存する。そのため `req.signal` を `abortSignal` に渡さず、`vercel.json` の `functions` に `supportsCancellation` を付けない（付けると、切断で `req.signal` が abort される）
- 停止は、`POST /api/chat/[threadId]/stop` が `ai_threads.stop_requested_at` を書き、走っている関数が定期的に読んで自分の生成を abort する。同じ読み取りで生存の印（`run_heartbeat_at`）を更新し、`HEARTBEAT_STALE_MS` のあいだ更新の無い実行中の印は、次の要求が取り直す
- 再読み込みや切断のあとは、クライアントが `GET /api/chat/[threadId]` をポーリングし、生成が終わったら DB のメッセージに置き換える。ストリームの再開（resumable-stream）はしない
- 直前のステップの入力トークン数（`ai_threads.last_input_tokens`）が `MAX_CONTEXT_INPUT_TOKENS` を超えたスレッドは、文脈の上限に届く前に 409 で断り、新しいチャットへ移ってもらう

### 会話の不変条件

スレッドの間、Claude に送る system（`AGENT_INSTRUCTIONS`）、tools の集合と定義、model、effort、thinking の設定を変えない。履歴は追記だけにし、編集・削除・regenerate の口を作らない。送り返す thinking ブロックの署名は、system・tools・それより前のメッセージに結び付いていて、変えるとその位置から後ろの thinking が無効になる。prompt cache も作り直しになる。

- thinking に `blockBinding: { prefixMismatchBehavior: 'drop_block' }` を付けているので、噛み合わない thinking は 400 にならず、API に落とされる。落とされたステップは `onStepEnd` が console.error で残す。system や tools を変えてデプロイすると、既存のスレッドでこれが出る
- DB から組み直した履歴が、ループの中で送った形と1字でもずれると、同じことが起きる。`toUIMessageStream` の `onError` の戻り値は tool のエラー文として保存され、次のターンで送り返されるので、ループの中で送る `error.message` と同じ値を返す

### オーナー API

tool は、オーナー API（`https://api.k8o.me/owner/*`。`apps/api/CLAUDE.md`）から記事の一覧と本文を読む（`agent/infrastructure/owner-api.ts`）。本番も preview も本番の api を呼ぶ。トークンは `OWNER_API_TOKEN` で、本番と preview で別の値を Vercel に sensitive で置く（本番は api の `OWNER_API_TOKEN_AI`、preview は `OWNER_API_TOKEN_AI_PREVIEW` と同じ値）。未設定のときは tool がエラーを返すだけで、会話は続く。

## 認証 & コスト保護

Better Auth + GitHub OAuth（`@repo/ai-database/auth`）。**本人のみ**利用可（`ALLOWED_EMAILS`）。

LLM（Claude API）は課金が発生するため、**課金が発生する全 API route / server action の先頭で `shared/auth/require-allowed-session.ts` を呼び、未許可は弾く（API route は 401 を返し、server action は null・空配列・false などを返す）**こと（`src/proxy.ts` は matcher で `/api` を外しているため必須の防御層）。

認証の実装は `@repo/auth-shell`（`packages/auth-shell/CLAUDE.md`）にある。認証まわりを直すときはそちらを直し、ai 側にコピーを作らない。認証の有効/無効は `@repo/auth-shell/auth-enabled` に集約。Vercel preview は認証OFF（= preview URL は課金の開き戸になるため、ai プロジェクトには Vercel Deployment Protection を併用する）。

ローカル開発URLは `https://ai.k8o.localhost/`。`LOCAL_AUTH_BYPASS=true`（`.env.local`, NODE_ENV=development のときのみ）でログインを省略できる。

## 利用回数と予算

生成回数の上限（アプリと利用者ごとに1時間あたり `AI_GENERATE_LIMIT_PER_HOUR` 回）と月の予算（UTC の月初からの全行の費用の合計が $100 未満）は `ai_usages` の行で数える。Claude を呼ぶ経路は、`/api/generate` も `/api/chat` も、呼ぶ前に `reserveUsage`（`usage/application/usage.ts`）で行を予約し、予約できなければ 429 で断る。`reserveUsage` を通さずに Claude を呼ばない。トークン数と費用は `recordUsage` で、予約した行へあとから書き込む。単価は `usage/application/pricing.ts` にある。

- 予算は、アプリと利用者で絞らずに数える
- エージェントは、tool を呼んだステップのあとにも予算を確かめて止まる。同時に走る実行はどれも予約を通れるので、予算を超えるのは、同時の実行の数 × 1ステップ分まで
- 予算に数えないもの
  - preview（`ai-preview` の DB）の分。本番とは別に数える
  - api の記事の要約。`ANTHROPIC_API_KEY` は Vercel の Shared Environment Variables で api と共有しているが、api の分は `ai_usages` に載らない
  - 中断したステップと、途中でエラーになったステップの usage。記録されずに欠けることがある
- 最後の歯止めは、キーに紐づいたサブスクの月のクレジット。使い切ると API が止まり、請求はされない。ai 専用のキーや Anthropic Console の支出上限は置いていない

## Storybook MCP

ai の Storybook は Chromatic に公開しておらず、`.mcp.json` にも Storybook MCP を登録していない。@k8ordo/ui の props は `apps/ai/node_modules/@k8ordo/ui/docs/` を参照（propsを推測で使わない方針はルートのCLAUDE.md「UI共通」どおり）。

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
