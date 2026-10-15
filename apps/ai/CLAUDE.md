# apps/ai CLAUDE.md

AI関連ツールの置き場（`ai.k8o.me`）。@k8ordo/ui × Claude の v0風デザインシステム壁打ちツール（`/`）、スライド生成（`/slides`）、k8o のブログ記事を読めるエージェントとのチャット（`/chat`）がある。

## レイヤー構成（src/）

apps/main と同じ `app / features / shared` 構成（詳細は `apps/main/CLAUDE.md`）。Server Actions（`'use server'`）は `features/*/interface` に置く。

- `generation/` - Claude（Sonnet 5.5 / Opus 5.5、AI SDK v7 と @ai-sdk/anthropic）による json-render spec とスライドの生成
- `agent/` - `/chat` のエージェント。tool つきの生成のループ、スレッドとメッセージの保存（ai_threads・ai_thread_messages）、オーナー API から記事を読む tool、UI を作って直す tool
- `usage/` - Claude の利用ログ（ai_usages）、1時間あたりの生成回数の上限、月の予算と単価（`pricing.ts`）
- `share/` - 公開共有（公開/非公開化。/s/[slug] は DB の spec をその場で描画）
- `projects/` - プロジェクト・版の永続化（@repo/ai-database）
- `artifacts/` - 生成物と版の保存（ai_artifacts・ai_artifact_versions）。版の行は書き換えず、直すたびに次の番号の版を足す。読むのは持ち主の版だけ
- `highlight/` - 生成物（spec JSON / spec から変換した TSX / スライド）の shiki ハイライト
- `slides/` - デッキ Markdown のスライド分割とコードブロックの抽出（`parse-deck.ts`）

`shared/claude/` には、generation・agent・usage が共通で使うモデルの定義（`models.ts`）と provider（`claude-provider.ts`）を置く。

## 文言のロケール

@k8ordo/ui の組み込み文言（閉じる・必須・コピーしましたなど）は `@k8ordo/i18n` のロケール集合で決まり、集合が無い環境では英語になる。集合は `src/i18n.ts` の1か所で定義し、サーバーの描画（`app/layout.tsx`・`global-error.tsx`）とブラウザ（`_providers/app.tsx`）の両方から副作用 import する。`@repo/auth-shell` の部品もこの集合に乗る。

## 生成 UI（json-render）

UI スタジオとエージェントの `generate_ui` は、どちらも json-render の spec を作る。コード表示の TSX は `spec-to-tsx.ts` で spec から変換する。catalog・registry・検証は
`@k8ordo/ui/json-render`（公式アダプタ）を使い、独自の catalog は作らない。

- system prompt は `catalog.prompt({ mode: 'inline', ... })`（`build-spec-system-prompt.ts`）。
  inline モードなので assistant の出力は「会話文 → JSONL パッチ」の混在ストリーム
- 描画は `JsonRenderUI`（`app/_components/spec-preview`）。アプリと同じドキュメントに描画するので、テーマ・フォントはアプリのものを継承する
- 同じ文書の画面より狭い枠に描くので、ビューポートのメディアクエリでは並べ方が変わらない。そのため system prompt の規則で、描く枠の幅（280〜960px ほど）を伝え、横に並べるときは Grid の `cols: 'auto-fit'` と `minItemSize` を使うよう求める。依頼に列の数があっても固定の cols にしない

### スタジオ（/api/generate）

- サーバは `pipeJsonRender`（@json-render/core）でパッチ行を `data-spec` パーツへ分離し、
  クライアントは `specFromMessage`（`spec-message.ts`）で土台 spec へ逐次適用して描画する
- 完了時は `validateGeneratedSpec` で検証し、失敗時は repairPrompt を次ターンの system に流す

### エージェントの tool（generate_ui）

- tool の中で Claude を1回ずつ呼び、`streamUiSpec`（`stream-ui-spec.ts`）がサーバーで spec を組み立てる。`createMixedStreamParser` で会話文とパッチを分け、土台の複製にパッチを当てる。会話文の行は改行で繋ぎ、タイトル行を除いた説明を要約にする
- system は毎回同じ `buildSpecSystemPrompt()` にして、末尾に cache のブレークポイントを置く。直すときの土台と修復の指示は user の文（`buildUserPrompt`）に置き、system には連結しない
- 組み上がった spec は `validateGeneratedSpec` で検証し、落ちたら壊れた spec を土台に、tool の中で1回だけ直させる（`ui-spec.ts`）。それでも通らなければ tool のエラーにする

## エージェント（/chat）

`/chat` は新しいスレッド、`/chat/[threadId]` は既存のスレッドの画面（`app/(authenticated)/chat/`）。サイドバーの枠（ToolNav・サインアウト・テーマ・スマホの Drawer）は `(authenticated)/layout` の `ToolFrame` にあり、ツールごとの一覧は `@sidebar` のスロット（チャットはスレッドを移っても作り直さないよう `@sidebar/chat/layout`）が描く。

- `POST /api/chat` が、`streamText` に tool（`list_blogs`・`read_blog`・`generate_ui`）を渡してループを回す。ステップ数や時間の上限は `agent/application/agent-run.ts` にある
- `generate_ui`（`agent/application/generate-ui.ts`）は、UI を新しく作るか、`base` で指した持ち主の版を土台に直して、`features/artifacts` に版として保存する
  - 利用者・会話・モデルは `toolsContext` で渡す。時間の上限は、ほかの tool より長い `UI_TOOL_TIMEOUT_MS`
  - execute は async generator で、書きかけの spec を間引いて preliminary の出力で流し、最後に保存した版（artifactId・版・要約・spec）を流す
  - Claude に送り返すのは、`toModelOutput` の短い文（artifactId・版・タイトル・要約）だけで、spec は送らない
- 会話には `generate_ui` の呼び出しをカードで出し、UI を横のペインでプレビューする。ペインでは、spec の JSON と、spec から変換した TSX も見てコピーできる。xl 以上は会話 440px とペインの2列にし、それより狭い幅ではタブで1枚ずつ出す
  - カードとペインは、メッセージの tool の出力だけから描く。ペインに出す呼び出しは、`agent/application/ui-artifacts.ts` が描画中に導く。初期値は最後の UI に追従し、カードで固定するか閉じても、新しい生成が始まると追従に戻る
  - カードや xl 未満のタブで開いた（固定した）呼び出しは、`?pane=<toolCallId>` で URL に持つ。固定した時点の最後の呼び出しが別なら `&since=<toolCallId>` も持ち、固定が解けたかを URL とメッセージだけで決める。固定は、この会話のパス（`/chat/<id>`）にいるあいだ描画中に URL から導くので、再読み込みしても同じ UI が開く。ほかのパスにいるあいだ（Activity で隠れているあいだ）は、最後に読んだ固定を保ち、ペインをマウントし直さない。xl 未満では、`pane` があるあいだプレビューを出す。閉じた状態とビュー（プレビュー・spec・TSX）は URL に持たない
  - URL は `history` の pushState・replaceState で書く（`chat-screen/use-pane-pin.ts`）。開くとき、URL に `pane` が無ければ積み、あれば置き換える。外すときは、この文書で積んだ記録なら `history.back()` で戻り、そうでなければ置き換えて消す。そのため xl 未満の戻るは、プレビューを閉じて会話に戻る。history に渡す state に Next の `__NA` を入れない（入れると Next がルーターに伝えず、`useSearchParams` が変わらない）
  - ペインの見出しで、出している UI と同じ会話の中の、同じ artifactId のできた版を選べる。選ぶと、カードで固定したのと同じく `?pane=` に持つ。生成中と止めた途中の UI は版に数えず、それを出しているあいだは選ぶ口を出さない
  - xl 以上では、ペインの見出しの「全画面で見る」で会話の列を隠し、ペインを作業領域いっぱいに広げる。会話はマウントしたまま隠す。広げた状態は ChatScreen の state に持って URL には持たず、ペインが消えると戻る
  - 生成 UI のリンクとフォームは、ペインの包みで移動を止める。会話の画面ごと移動すると受信が切れるため。/s/[slug] ではリンクが動いてよいので、共有の `SpecPreview` には入れない
- スレッドの ID はページが決め、最初の POST が予約を通ったときに、サーバーがスレッドの行を作る
- メッセージは UIMessage を JSON のまま `ai_thread_messages` に追記する。user は実行の開始時、assistant は終了時に1行ずつ書く。終わり方（完了・停止・予算・エラーなど）は assistant の `metadata.end` に残す
- ブラウザが切断しても、生成は最後まで続けて返答を保存する。そのため `req.signal` を `abortSignal` に渡さず、`vercel.json` の `functions` に `supportsCancellation` を付けない（付けると、切断で `req.signal` が abort される）
- 停止は、`POST /api/chat/[threadId]/stop` が `ai_threads.stop_requested_at` を書き、走っている関数が定期的に読んで自分の生成を abort する。同じ読み取りで生存の印（`run_heartbeat_at`）を更新し、`HEARTBEAT_STALE_MS` のあいだ更新の無い実行中の印は、次の要求が取り直す
- 再読み込みや切断のあとは、クライアントが `GET /api/chat/[threadId]` をポーリングし、生成が終わったら DB のメッセージに置き換える。ストリームの再開（resumable-stream）はしない
- 直前のステップの入力トークン数（`ai_threads.last_input_tokens`）が `MAX_CONTEXT_INPUT_TOKENS` を超えたスレッドは、文脈の上限に届く前に 409 で断り、新しいチャットへ移ってもらう

### 会話の不変条件

スレッドの間、Claude に送る system（`AGENT_INSTRUCTIONS`）、tools の集合と定義、model、effort、thinking の設定を変えない。履歴は追記だけにし、編集・削除・regenerate の口を作らない。送り返す thinking ブロックの署名は、system・tools・それより前のメッセージに結び付いていて、変えるとその位置から後ろの thinking が無効になる。prompt cache も作り直しになる。

- thinking に `blockBinding: { prefixMismatchBehavior: 'drop_block' }` を付けているので、噛み合わない thinking は 400 にならず、API に落とされる。落とされたステップは `onStepEnd` が console.error で残す。system や tools を変えてデプロイすると、既存のスレッドでこれが出る
- DB から組み直した履歴が、ループの中で送った形と1字でもずれると、同じことが起きる。`toUIMessageStream` の `onError` の戻り値は tool のエラー文として保存され、次のターンで送り返されるので、ループの中で Claude に送る文字列と同じ規則（@ai-sdk/provider の `getErrorMessage`。Error なら `toString()`、文字列ならそのまま）で返す。この戻り値は、ストリーム全体のエラーで画面に出す文言にもなる
- tool の `toModelOutput` は、ループの中では生の値で、次のターンでは DB から戻した値で呼ばれる。どちらでも同じ文になるよう、tool の input と output だけから決める
- 止めた返答の、結果の届かなかった tool の呼び出しは、`ignoreIncompleteToolCalls` で落として送る。落とすと thinking だけになるステップは、送る前にステップごと落とす（`drop-thinking-only-steps.ts`）

### オーナー API

tool は、オーナー API（`https://api.k8o.me/owner/*`。`apps/api/CLAUDE.md`）から記事の一覧と本文を読む（`agent/infrastructure/owner-api.ts`）。本番も preview も本番の api を呼ぶ。トークンは `OWNER_API_TOKEN` で、本番と preview で別の値を Vercel に sensitive で置く（本番は api の `OWNER_API_TOKEN_AI`、preview は `OWNER_API_TOKEN_AI_PREVIEW` と同じ値）。未設定のときは tool がエラーを返すだけで、会話は続く。

## 認証 & コスト保護

Better Auth + GitHub OAuth（`@repo/ai-database/auth`）。**本人のみ**利用可（`ALLOWED_EMAILS`）。

LLM（Claude API）は課金が発生するため、**課金が発生する全 API route / server action の先頭で `shared/auth/require-allowed-session.ts` を呼び、未許可は弾く（API route は 401 を返し、server action は null・空配列・false などを返す）**こと（`src/proxy.ts` は matcher で `/api` を外しているため必須の防御層）。

認証の実装は `@repo/auth-shell`（`packages/auth-shell/CLAUDE.md`）にある。認証まわりを直すときはそちらを直し、ai 側にコピーを作らない。認証の有効/無効は `@repo/auth-shell/auth-enabled` に集約。Vercel preview は認証OFF（= preview URL は課金の開き戸になるため、ai プロジェクトには Vercel Deployment Protection を併用する）。

ローカル開発URLは `https://ai.k8o.localhost/`。`LOCAL_AUTH_BYPASS=true`（`.env.local`, NODE_ENV=development のときのみ）でログインを省略できる。

## 利用回数と予算

生成回数の上限（アプリと利用者ごとに1時間あたり `AI_GENERATE_LIMIT_PER_HOUR` 回）と月の予算（UTC の月初からの全行の費用の合計が $100 未満）は `ai_usages` の行で数える。Claude を呼ぶ経路は、`/api/generate` も `/api/chat` も、呼ぶ前に `reserveUsage`（`usage/application/usage.ts`）で行を予約し、予約できなければ 429 で断る。`reserveUsage` を通さずに Claude を呼ばない。トークン数と費用は `recordUsage` で、予約した行へあとから書き込む。単価は `usage/application/pricing.ts` にある。

- 行は、アプリ（`app`）と、Claude を呼んだ種類（`kind`）を持つ。`/api/generate` と `/api/chat` は `'generation'` で予約する
- `generate_ui` は、tool の中で Claude を呼ぶたびに `app: 'agent'`・`kind: 'ui'` で別に予約し、tool が返る前に usage を書き終える。断られても 429 にはならず、断りの文言（`USAGE_REFUSAL_MESSAGES`）で tool のエラーになる。1時間の枠なら会話は続き、予算ならそのステップのあとの確かめで止まる
- 1時間の上限は、種類で絞らずに、アプリと利用者ごとの全行を数える
- 予算は、アプリと利用者で絞らずに数える
- エージェントは、tool を呼んだステップのあとにも予算を確かめて止まる。同時に走る実行はどれも予約を通れるので、予算を超えるのは、同時の実行の数 × 1ステップ分まで
- 1ステップで並べた `generate_ui` も、どれも同じ時点の予算を見て予約を通る。そのため、1ステップで並べた `generate_ui` の数 × 最大2回分（修復を含む）の生成まで、さらに予算を超えうる。歯止めは1時間の枠
- 予算に数えないもの
  - preview（`ai-preview` の DB）の分。本番とは別に数える
  - api の記事の要約。`ANTHROPIC_API_KEY` は Vercel の Shared Environment Variables で api と共有しているが、api の分は `ai_usages` に載らない
  - 中断したステップと、途中でエラーになったステップの usage。記録されずに欠けることがある。`generate_ui` の中の呼び出しは、`anthropic.message_start` が持つ入力と cache のトークンだけを記録し、出力の分が欠ける
- 最後の歯止めは、キーに紐づいたサブスクの月のクレジット。使い切ると API が止まり、請求はされない。ai 専用のキーや Anthropic Console の支出上限は置いていない

## Storybook MCP

ai の Storybook は Chromatic に公開しておらず、`.mcp.json` にも Storybook MCP を登録していない。@k8ordo/ui の props は `apps/ai/node_modules/@k8ordo/ui/docs/` を参照（propsを推測で使わない方針はルートのCLAUDE.md「UI共通」どおり）。

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
