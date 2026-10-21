# apps/ai CLAUDE.md

AI関連ツールの置き場（`ai.k8o.me`）。k8o のブログ記事と k8o.me の運営のデータ（概要・お問い合わせ・記事ごとの閲覧数・ブラウザからのレポート）、k35o の GitHub のリポジトリを読み、web を検索して読み、UI とスライドを作れるエージェントとのチャット（`/chat`）と、チャットで作った UI とスライドを版の履歴ごと見返し、版を公開・フォークできる生成物のページ（`/artifacts`）がある。`/` は `/chat` へ移す（`next.config.ts` の redirects）。

## レイヤー構成（src/）

apps/main と同じ `app / features / shared` 構成（詳細は `apps/main/CLAUDE.md`）。Server Actions（`'use server'`）は `features/*/interface` に置く。

- `generation/` - エージェントの tool（`generate_ui`・`generate_slides`）の中で Claude（Sonnet 5.5 / Opus 5.5、AI SDK v7 と @ai-sdk/anthropic）を呼び、json-render の spec とスライドのデッキを作る部品（system prompt・ストリームの読み取り・受け取りの確かめ）と、spec から TSX への変換
- `agent/` - `/chat` のエージェント。tool つきの生成のループ、スレッドとメッセージの保存（ai_threads・ai_thread_messages）、オーナー API から記事と k8o.me の運営のデータを読む tool、GitHub から k35o のリポジトリを読む tool、Claude API の中で web を検索して読む tool、UI とスライドを作って直す tool
- `usage/` - Claude の利用ログ（ai_usages）、1時間あたりの生成回数の上限、月の予算と単価（`pricing.ts`）
- `share/` - 公開ページ（/s/[slug]）の読み取り。slug から公開している生成物の版を引き、タイトルと中身にして返す
- `artifacts/` - 生成物と版の保存と読み取り（ai_artifacts・ai_artifact_versions）と、その公開（ai_artifact_shares）。版の行は書き換えず、直すたびに次の番号の版を足す。読むのは持ち主のものだけで、版の中身のほかに、生成物の一覧（最新版の新しい順）と、生成物ごとの全版の履歴を読める。公開は、持ち主が選んだ版を公開の行に書く。公開中に別の版を公開すると、slug を変えずに版だけを差し替える。公開する版を変える操作は、公開の行があるときだけ版を差し替え、無ければ書かない。別のタブで取り消したあとの古い画面から押されても、取り消した生成物を公開し直さないため。取り消すと行を消すので、公開し直すと別の slug になる。フォークは、持ち主の版の中身と要約を写した版 1 で新しい生成物を作り、元の版を親（parent_id）にする。依頼から生まれた版ではないので依頼は空にし、会話に属さないので thread_id は null にする。公開ページのための、slug から公開している版の id を引く読み取りと、版の id から中身を引く読み取りだけは、持ち主で絞らない
- `highlight/` - 生成物（spec JSON / spec から変換した TSX / スライド）の shiki ハイライト。許す言語、長さとブロック数の上限、shiki の呼び出しは `application/highlight.ts` に置き、画面から呼ぶ server action（`highlightGenerated`）は、引数の形とセッションを確かめてからそれを呼ぶ。公開ページは、公開した版の中身だけを入力に、セッションを通さずに呼ぶ
- `slides/` - デッキ Markdown のスライド分割、コードブロックの抽出（デッキ全体の並びは `deckCodeBlocks`）、閉じていないコードブロックの検出、発表者ノートを外したデッキ（`stripNotes`）（`parse-deck.ts`）

`shared/claude/` には、generation・agent・usage が共通で使うモデルの定義（`models.ts`）と provider（`claude-provider.ts`）を置く。provider は、Claude API への要求の本文に `web_fetch` の定義があれば、読む URL の出どころ（`url_sources`）を足して送る（`createAnthropic` の `fetch`）。@ai-sdk/anthropic が `url_sources` を API に渡せないため。`web_fetch` の無い要求の本文は変えない

## 文言のロケール

@k8ordo/ui の組み込み文言（閉じる・必須・コピーしましたなど）は `@k8ordo/i18n` のロケール集合で決まり、集合が無い環境では英語になる。集合は `src/i18n.ts` の1か所で定義し、サーバーの描画（`app/layout.tsx`・`global-error.tsx`）とブラウザ（`_providers/app.tsx`）の両方から副作用 import する。`@repo/auth-shell` の部品もこの集合に乗る。

## 生成 UI（json-render）

エージェントの `generate_ui` は、json-render の spec を作る。コード表示の TSX は `spec-to-tsx.ts` で spec から変換する。catalog・registry・検証は
`@k8ordo/ui/json-render`（公式アダプタ）を使い、独自の catalog は作らない。

- system prompt は `catalog.prompt({ mode: 'inline', ... })`（`build-spec-system-prompt.ts`）。
  inline モードなので assistant の出力は「会話文 → JSONL パッチ」の混在ストリーム
- 描画は `JsonRenderUI`（`app/_components/spec-preview`）。アプリと同じドキュメントに描画するので、テーマ・フォントはアプリのものを継承し、auth-shell の CSP も効く
  - CSP の img-src は自分のオリジンと data:・blob: だけなので、Avatar の src が外の URL なら読み込めない。ブラウザで描き始めたとき（ペインを開く・画面を移る）は頭文字になる。サーバーで描いた最初の画面（`/chat/<threadId>`・`/artifacts/<artifactId>`・`/s/<slug>` を直接開くか再読み込みしたとき）は、ハイドレーションより前に読み込みが失敗して onError が届かず、壊れた画像の印が残った丸になる
- 同じ文書の画面より狭い枠に描くので、ビューポートのメディアクエリでは並べ方が変わらない。そのため system prompt の規則で、描く枠の幅（280〜960px ほど）を伝え、横に並べるときは Grid の `cols: 'auto-fit'` と `minItemSize` を使うよう求める。依頼に列の数があっても固定の cols にしない
- tool の中で Claude を1回ずつ呼び、`streamUiSpec`（`stream-ui-spec.ts`）がサーバーで spec を組み立てる。`createMixedStreamParser` で会話文とパッチを分け、土台の複製にパッチを当てる。会話文の行は改行で繋ぎ、タイトル行を除いた説明を要約にする
- system は毎回同じ `buildSpecSystemPrompt()` にして、末尾に cache のブレークポイントを置く。直すときの土台と修復の指示は user の文（`buildUserPrompt`）に置き、system には連結しない
- 組み上がった spec は `validateGeneratedSpec` で検証し、落ちたら壊れた spec を土台に、tool の中で1回だけ直させる（`ui-spec.ts`）。それでも通らなければ tool のエラーにする

## スライド（Markdown のデッキ）

エージェントの `generate_slides` は、Markdown のデッキを作る。system prompt は `build-slides-system-prompt.ts`。出力は、バッククォート4つの md のフェンスで囲んだデッキと、そのあとの json のフェンスの meta（title・description・changes）で、`parseSlidesGeneration`（`parse-slides-generation.ts`）が切り出す。スライドの分割とコードブロックの抽出は `slides/application/parse-deck.ts`、描画は `app/_components/slide-deck` にある。

- tool の中で Claude を1回呼び、`streamSlidesDeck`（`stream-slides-deck.ts`）が届いた text を積み上げる。usage と終わり方は、`streamUiSpec` と同じ `generationTextOf`（`generation-stream.ts`）で読む
- system は毎回同じ `buildSlidesSystemPrompt()` にして、末尾に cache のブレークポイントを置く。直すときの土台のデッキは user の文（`slidesUserPrompt`）に置き、system には連結しない
- 書き終えた出力は、`settleSlidesDeck`（`slides-deck.ts`）が次の3つを確かめて受け取る。満たさなければ、書き直させずに tool のエラーにする
  - デッキの囲みが閉じて、途中で切れていない（`isSourceComplete`）。外側を3つのバッククォートで書かれると、中のコードブロックのフェンスの行でデッキが切れ、本当の閉じフェンスが後ろに残る。そのため、閉じたあと meta の手前までにフェンスだけの行が残れば、切れたとみなす
  - デッキの中のコードブロックが閉じている（`hasUnclosedCodeFence`）
  - スライドが1枚以上ある
- タイトルは tool の入力から取り、meta は要約にだけ使う。meta が無くても受け取る
- 書きかけのデッキは、1枚以上のスライドが読めてから流す。考えているあいだは、直すときも土台を流さない。スライドは全文の置き換えで、土台から続かないため
- Markdown の画像は、system で禁じ、描画（`DeckSlideView`）でも描かない

### 印刷（PDF出力）

- 印刷用の全スライド（`DeckPrint`）は、`DeckPreview` の `printable` が真のときだけ、body へのポータルに 1280×720 のページとして描く。ブラウザの印刷で PDF にする。真にするのは、生成物のページと公開ページ
- 文書全体に効く印刷の規則（`@page` と、body の直下の印刷用のスライド以外を印刷から外す規則）は、CSS Modules に置かない。ポータルの中の `<style>` に置き、印刷用のスライドを表示しているあいだだけ有効にする。Activity で隠れた画面に残ったポータルは、ほかの画面の印刷に効かない
- 印刷用のスライドを描く画面の中で、デッキを `<Activity>` で隠さない。隠すと印刷の規則も切れ、印刷にスライドが出ない。タブなどで隠すときは CSS で隠す

## エージェント（/chat）

`/chat` は新しいスレッド、`/chat/[threadId]` は既存のスレッドの画面（`app/(authenticated)/chat/`）。サイドバーの枠（ToolNav・サインアウト・テーマ・スマホの Drawer）は `(authenticated)/layout` の `ToolFrame` にあり、ツールごとの一覧は `@sidebar` のスロット（チャットはスレッドを移っても作り直さないよう `@sidebar/chat/layout`）が描く。

- `POST /api/chat` が、`streamText` に tool（`list_blogs`・`read_blog`・`generate_ui`・`generate_slides`・`list_github_repos`・`read_github_file`・`search_github_code`・`search_github_issues`・`read_github_issue`・`get_site_overview`・`list_inquiries`・`list_blog_stats`・`list_browser_reports`・`web_search`・`web_fetch`）を渡してループを回す。ステップ数や時間の上限は `agent/application/agent-run.ts` にある
- `generate_ui`（`agent/application/generate-ui.ts`）と `generate_slides`（`agent/application/generate-slides.ts`）は、UI・スライドを新しく作るか、`base` で指した持ち主の版を土台に直して、`features/artifacts` に版として保存する。生成物は kind（`'ui'`・`'slides'`）で分けて読むので、もう一方の tool で作った artifactId を `base` に渡されても見つからない
  - 利用者・会話・モデルは `toolsContext` で渡す。時間の上限は、ほかの tool より長い `UI_TOOL_TIMEOUT_MS`・`SLIDES_TOOL_TIMEOUT_MS`
  - execute は async generator で、書きかけ（spec か、デッキの source）を間引いて preliminary の出力で流し、最後に保存した版（artifactId・版・要約・spec か source）を流す
  - Claude に送り返すのは、`toModelOutput` の短い文（artifactId・版・タイトル・要約）だけで、spec と source は送らない
  - tool の文脈の schema、Claude を呼ぶ前の予約と返る前の記録、書きかけを流す間隔、要約の切り詰めは、2つの tool で `agent/application/artifact-tool.ts` を使う
- 会話には `generate_ui`・`generate_slides` の呼び出しをカードで出し、UI とスライドを横のペインでプレビューする。ペインでは、UI は spec の JSON と spec から変換した TSX を、スライドはデッキの Markdown を見てコピーできる。xl 以上は会話 440px とペインの2列にし、それより狭い幅ではタブで1枚ずつ出す
  - カードとペインは、メッセージの tool の出力だけから描く。ペインに出す呼び出しは、`agent/application/chat-artifacts.ts` が描画中に導く。UI とスライドの呼び出しを1つの列に並べ、初期値は最後の生成物に追従し、カードで固定するか閉じても、新しい生成が始まると追従に戻る
  - ビュー（プレビュー・spec・TSX・Markdown）は ChatScreen の state に持ち、出している生成物の kind に無いビューはプレビューとして描く
  - カードや xl 未満のタブで開いた（固定した）呼び出しは、`?pane=<toolCallId>` で URL に持つ。固定した時点の最後の呼び出しが別なら `&since=<toolCallId>` も持ち、固定が解けたかを URL とメッセージだけで決める。固定は、この会話のパス（`/chat/<id>`）にいるあいだ描画中に URL から導くので、再読み込みしても同じ生成物が開く。ほかのパスにいるあいだ（Activity で隠れているあいだ）は、最後に読んだ固定を保ち、ペインをマウントし直さない。xl 未満では、`pane` があるあいだプレビューを出す。閉じた状態とビューは URL に持たない
  - URL は `history` の pushState・replaceState で書く（`chat-screen/use-pane-pin.ts`）。開くとき、URL に `pane` が無ければ積み、あれば置き換える。外すときは、この文書で積んだ記録なら `history.back()` で戻り、そうでなければ置き換えて消す。そのため xl 未満の戻るは、プレビューを閉じて会話に戻る。history に渡す state に Next の `__NA` を入れない（入れると Next がルーターに伝えず、`useSearchParams` が変わらない）
  - ペインの見出しで、出している生成物と同じ会話の中の、同じ artifactId のできた版を選べる。選ぶと、カードで固定したのと同じく `?pane=` に持つ。生成中と止めた途中のものは版に数えず、それを出しているあいだは選ぶ口を出さない
  - できた版を出しているあいだは、ペインの見出しの「作ったもののページを開く」で、その版の生成物のページ（`/artifacts/<artifactId>?v=<版>`）へ移れる。生成中と止めた途中のものは版になっていないので出さない。移っても会話の画面は Activity で隠れて残り、戻ると同じ状態に戻る
  - xl 以上では、ペインの見出しの「全画面で見る」で会話の列を隠し、ペインを作業領域いっぱいに広げる。会話はマウントしたまま隠す。広げた状態は ChatScreen の state に持って URL には持たず、ペインが消えると戻る
  - ペインの本文（プレビューとコード）は、会話の外でも使える `ArtifactBody`（`(authenticated)/_components/artifact-body`）で描く。見出し・版の切り替え・止めた途中の注記はペインが持つ
  - 生成 UI とスライドのリンクと、生成 UI のフォームは、`ArtifactBody` の包みで移動を止める。会話の画面ごと移動すると受信が切れ、生成物のページでも見ていた版から離れるため。/s/[slug] ではリンクが動いてよいので、共有の `SpecPreview` には入れない
  - スライドは `DeckPreview`（`app/_components/deck-preview`）で描く。デッキのコードブロックのハイライトは、アプリのテーマに合わせる（`(authenticated)/_components/deck-highlight` の `useDeckHighlight`）。矢印・Space・PageUp/Down・Home/End は、デッキにフォーカスがある（スライドを押した）ときだけ効き、会話のスクロールを奪わない
  - ペインには印刷用の全スライド（`DeckPrint`）を描かない。印刷用のスライドを表示しているあいだはほかの要素が印刷から外れ、会話の画面を印刷してもスライドしか出なくなるため
- スレッドの ID はページが決め、最初の POST が予約を通ったときに、サーバーがスレッドの行を作る
- `/chat?draft=<文>` は、その文を新しいチャットの入力欄に入れるだけで送らない。だれでも作れる URL なので、送るのはいつも利用者の操作にする。最初の送信で URL が `/chat/<id>` に置き換わり、`draft` は消える
- メッセージは UIMessage を JSON のまま `ai_thread_messages` に追記する。user は実行の開始時、assistant は終了時に1行ずつ書く。終わり方（完了・停止・予算・エラーなど）は assistant の `metadata.end` に残す
- ブラウザが切断しても、生成は最後まで続けて返答を保存する。そのため `req.signal` を `abortSignal` に渡さず、`vercel.json` の `functions` に `supportsCancellation` を付けない（付けると、切断で `req.signal` が abort される）
- 停止は、`POST /api/chat/[threadId]/stop` が `ai_threads.stop_requested_at` を書き、走っている関数が定期的に読んで自分の生成を abort する。同じ読み取りで生存の印（`run_heartbeat_at`）を更新し、`HEARTBEAT_STALE_MS` のあいだ更新の無い実行中の印は、次の要求が取り直す
- 再読み込みや切断のあとは、クライアントが `GET /api/chat/[threadId]` をポーリングし、生成が終わったら DB のメッセージに置き換える。ストリームの再開（resumable-stream）はしない
- 直前のステップの入力トークン数（`ai_threads.last_input_tokens`）が `MAX_CONTEXT_INPUT_TOKENS` を超えたスレッドは、文脈の上限に届く前に 409 で断り、新しいチャットへ移ってもらう

### 会話の不変条件

スレッドの間、Claude に送る system（`AGENT_INSTRUCTIONS`）、tools の集合と定義、model、effort、thinking の設定を変えない。履歴は追記だけにし、編集・削除・regenerate の口を作らない。送り返す thinking ブロックの署名は、system・tools・それより前のメッセージに結び付いていて、変えるとその位置から後ろの thinking が無効になる。prompt cache も作り直しになる。

- thinking に `blockBinding: { prefixMismatchBehavior: 'drop_block' }` を付けているので、噛み合わない thinking は 400 にならず、API に落とされる。落とされたステップは `onStepEnd` が console.error で残す。system や tools を変えてデプロイすると、既存のスレッドでこれが出る
- DB から組み直した履歴が、ループの中で送った形と1字でもずれると、同じことが起きる。`toUIMessageStream` の `onError` の戻り値は tool のエラー文として保存され、次のターンで送り返されるので、ループの中で Claude に送る文字列と同じ規則（@ai-sdk/provider の `getErrorMessage`。Error なら `toString()`、文字列ならそのまま）で返す。この戻り値は、ストリーム全体のエラーで画面に出す文言にもなる
- その例外として、第三者が書ける文を返す tool（`tools.ts` の `WITHHOLDS_OUTPUT` が true のもの）の出力は、保存しない（`withhold-tool-outputs.ts`）
  - client の tool は、出力を決まった文（`WITHHELD_OUTPUT_TEXT`）に置き換える。置き換えた文は行に書くので、定数を変えても保存済みのスレッドの履歴はずれない。そのような tool の出力は文字列にし（`WithholdsOutput` の型が強いる）、`toModelOutput` を付けない（次のターンでは置き換えた文で呼ばれる）
  - provider が実行する tool は、結果の形を変えて送り返す道が無いので、結果の項目を落として呼び出しだけ（`input-available`）に戻す。エラーで終わったものも同じにする。呼び出しだけのパーツは `ignoreIncompleteToolCalls` で落ちるので、次のターンには呼び出しも結果も送らない。そのため、その tool の `toModelOutput` は、ループの中で次のステップに送るときにしか呼ばれない
  - 同じメッセージで最初に当たったパーツより後ろの reasoning を外す。text の引用（`providerMetadata.anthropic.citations`）も、すべての text から外す。引用には元の文が入り、指す結果を送らないため
  - 次のターンからは保存した形を送るので、その位置から後ろの prompt cache が一度だけ作り直しになり、それより後のターンは毎回同じ形を送る
- tool の `toModelOutput` は、ループの中では生の値で、次のターンでは DB から戻した値で呼ばれる。どちらでも同じ文になるよう、tool の input と output だけから決める
- 止めた返答の、結果の届かなかった tool の呼び出しは、`ignoreIncompleteToolCalls` で落として送る。落とすと thinking だけになるステップは、送る前にステップごと落とす（`drop-thinking-only-steps.ts`）

### オーナー API

tool は、オーナー API（`https://api.k8o.me/owner/*`。`apps/api/CLAUDE.md`）から、記事の一覧と本文と、k8o.me の運営のデータを読む（`agent/infrastructure/owner-api.ts`）。本番も preview も本番の api を呼ぶ。トークンは `OWNER_API_TOKEN` で、本番と preview で別の値を Vercel に sensitive で置く（本番は api の `OWNER_API_TOKEN_AI`、preview は `OWNER_API_TOKEN_AI_PREVIEW` と同じ値）。api 側の写しも sensitive で置かなければ、ここを sensitive にしても守りにならない。未設定のときは tool がエラーを返すだけで、会話は続く。値が Bearer のトークンの形（英数字と `-._~+/`、末尾の `=`）でなければ、改行が混ざったときにエラー文へ値が漏れないよう、api を呼ばずに値を入れない文でエラーを返す。

- 記事は `list_blogs`・`read_blog`（`agent/application/tools.ts`）が、運営のデータは `get_site_overview`（概要）・`list_inquiries`（お問い合わせと記事へのフィードバック）・`list_blog_stats`（記事ごとの閲覧数・フィードバックの件数・下書き）・`list_browser_reports`（CSP 違反などブラウザからのレポート）が読む（`agent/application/site-tools.ts`）。運営のデータの口は、api の MCP の読み取りの tool と同じ形を返す
- 1ページの件数は ai の定数で決めて毎回渡し（お問い合わせは 20 件、記事ごとの記録は 50 件、レポートは 10 件）、モデルには渡させない。次のページの番号は、api が返す全体の件数から決めて `nextPage` で返す。レポートの口は全体の件数を返さないので、ページが埋まっていれば次があるとみなし、ちょうど埋まった最後のページのあとは空のページを1回読む
- 200 でなければ、パスと状態のコードだけの決まった文で tool のエラーにし、同じ文をログに残す。query は入れない。応答の形は実行時に確かめない。型は hc が api のソースから取るので、口を変えるときは api を先にデプロイする
- `list_inquiries` と `list_browser_reports` の出力は保存しない（`WITHHOLDS_OUTPUT` が true。「会話の不変条件」）。お問い合わせの本文は匿名の第三者が書き、個人の情報も入りうるため。レポートの種別・URL・本文もだれでも送れ、URL には閲覧者が開いたページの URL が query ごと入りうるため。出力は字下げした JSON の文字列にして、第三者の値の改行や `"` を符号化し、JSON の文字列の外に出られないようにする。U+2028・U+2029 や全角の引用符で、行が変わったように見せる余地は残る。tool の入力は置き換えずに保存し、毎ターン送る。`list_browser_reports` の入力の `type` には、第三者が決めた種別（64 字まで）が写りうるので、その文は次のターン以降も Claude に届く。`get_site_overview` と `list_blog_stats` は k8o のデータ（件数・日時・状態・版・slug・タグ）だけなので、api の値をそのまま返して保存する。保存する tool の口に第三者の文の項目が足されると原文が残るので、口を変えるときは分け方も見直す

### GitHub

GitHub の tool（`list_github_repos`・`read_github_file`・`search_github_code`・`search_github_issues`・`read_github_issue`）は、REST API（`https://api.github.com`、版 `2026-03-10`）から k35o の公開リポジトリを読む（`agent/infrastructure/github-api.ts`）。出力の形と切り詰めは `agent/application/github-tools.ts` にある。

- 読む口は、リポジトリの一覧（`GET /users/k35o/repos`）、ファイルとディレクトリ（contents を object のメディアタイプで読む。1 MB を超えるファイルは GitHub が中身を返さない）、コードの検索（text-match の断片）、issue と PR の検索、issue と PR の本文・コメント・枝・変更したファイル。PR の変更後のファイルは、`read_github_issue` が返す head の SHA を `read_github_file` の `ref` に渡して読む
- fine-grained PAT は GitHub のすべての公開リポジトリを読めるので、owner は tool の入力に取らずにコードの定数（`GITHUB_OWNER`）にする。検索は `user:k35o` か `repo:k35o/<repo>` を足し、検索語の修飾子で範囲が広がっても、結果を k35o のものに絞る。owner を入力に取ると、だれでも作れるリポジトリが注入の入口になり、tool の引数が宛先を選べる送信にもなるため
- 宛先は `https://api.github.com` に固定する。モデルが決めた値は区切りごとに符号化して pathname に置き、空・`.`・`..` の区切りは弾く。リダイレクトは追わずにエラーにする。応答の中の URL（`Link` を含む）はたどらずにモデルにも渡さず、次のページは `page` を渡させて組み直す
- トークンは `GITHUB_READ_TOKEN`（読み取り専用の fine-grained PAT）で、本番と preview で別の PAT を Vercel に Sensitive で置く。Sensitive でない値は、prebuilt の workflow の `vercel pull` が、依存のコードも動くビルドの runner に書き出すため。実行時にだけ読むので、turbo.json と workflow には足さない。`GITHUB_TOKEN` は Actions のトークンで main が使っているので、この名前は使わない
- 未設定のときは tool がエラーを返すだけで、会話は続く。値に英数字と `_` のほかの文字（前後を含む改行など）があるときも、GitHub を呼ばずに値を入れない文のエラーにする。ヘッダーに使えない文字で fetch が投げる例外の文には、トークンがまるごと入るため
- エラー文は tool の結果として保存され、毎ターン送り返される。そのため、GitHub の応答の本文も、リポジトリ名やパスも入れずに、状態のコードから決まった文を作る。ログ（`console.error`）も、口の形と状態のコードだけを残す（404 と 422 は残さない）。上限（403・429）のときは待つ秒数を返し、自分では再試行しない
- 出力は保存しない（`WITHHOLDS_OUTPUT` が true。「会話の不変条件」）。再読み込みのあとは、tool の出力が決まった文になり、そのあとの思考の過程は出ない。次のターンで中身が要るときは、Claude が同じ入力で読み直す

### Web

`web_search`（`web_search_20250305`）と `web_fetch`（`web_fetch_20250910`）は、Anthropic が Claude API の要求の中で実行する server tool（`agent/application/web-tools.ts`）。検索もページの取得も Anthropic の側で行い、ai から外へは要求を出さない。`web_fetch` は PDF も読み、robots.txt・private のアドレス・資格情報らしい URL は API が断る。

- 版は dynamic filtering の無い素の版にする。`_20260209` 以降は中で code execution が動き、絞った第三者の文が平文で入る `code_execution` のパーツが会話に混ざる。それを切る `allowed_callers` を、SDK は server tool に渡せない
- `web_fetch` で読める URL の出どころは、利用者のメッセージと `web_search` の結果だけにする（`url_sources`。provider の `fetch` で足す）。client の tool の結果には、モデルが書いた文（generate_* の要約とエラー文、GitHub の検索語の見出し、入力の検証で落ちたときのエラー文）と、匿名の人が書ける値（お問い合わせの本文、レポートの URL）が写る。そこに中身を足した URL を置かせて読ませれば、外へ送れるため。読んだページの中のリンクも出どころにしない。ページに URL を並べるだけで、どれを読むかを選ばせて中身を伝える道ができるため。前のターンの検索の結果は保存しないので、前に見つけたページは検索し直してから読む（system で伝える）
- @ai-sdk/anthropic は、`web_search` の結果の title が null だと鍵ごと省き、同じ実行の次のステップへ送り返すときの検証で落ちる。`web_search` に `toModelOutput` を付けて、title を null で補う
- `url_sources` の書き足しと title の補いは、上流の版で直ったら戻す（`url_sources` は tool の引数に移し、`toModelOutput` は外す）。pnpm の patch にしないのは、Renovate が依存をまとめて上げる PR の install を、上流が直すまで毎回止めるため。送る定義の JSON は `web-tools.test.ts` が固定しているので、戻したあとも同じ JSON を送っているかを確かめられる
- 引数は API に送る tool の定義に入るので、変えると既存のスレッドの thinking が落ちる（「会話の不変条件」）。`web_search` は1要求 5 回まで。`web_fetch` は1要求 3 回まで、1本 30,000 トークンまで（`max_content_tokens`。続きを読む引数が無いので、大きな文書のページが切られずに収まる値）。`user_location`・ドメインの絞り込み・fetch の引用は渡さない
- 出力は保存しない（`WITHHOLDS_OUTPUT` が true。呼び出しだけに戻す。「会話の不変条件」）。返答の text の引用も外す。出典は、ai の SDK の出典のチップ（`sendSources`）を使わず、system で、読んだページの URL を返答のリンクで添えさせる
- 検索の代金は費用に入る（「利用回数と予算」）
- Anthropic Console の組織の設定で web search か web fetch が切られると、tools を送るすべての要求が 400 になり、チャットが止まる
- 応答のかたまりを SDK が読めなかったときのエラー（`TypeValidationError`・`JSONParseError`）は、message にかたまりの JSON をまるごと持ち、読んだページの本文や PDF の base64 も入る。生成エラーのログ（`streamText` の `onError`）には、エラーの連鎖のどこかにそれがあれば、名前と context だけを残す。画面のエラー表示には、ループの中と同じ規則（「会話の不変条件」）の文がそのまま出る。ストリーム全体のエラーなので保存はされない
- 残るもの
  - 攻撃する側が用意した URL の中からどれを読むかを注入で選ばせると、選んだことで少しずつ中身が伝わる。注入した文に URL を並べる形と、語ごとのページを索引に載せておき、検索語に中身を載せさせて当たったページを読ませる形がある。1回の読み取りで伝わるのは、選べる URL の数の対数ビット。閉じるには、`web_search` の結果を出どころから外すか、`allowed_domains` しかない
  - 検索語は Anthropic の検索の提供元に届く。お問い合わせの個人の情報を検索語に入れさせる注入は、system の1行でしか止まらない
  - `pause_turn` で、結果を待つ呼び出しが残らない形で止まると、実行は `completed` で終わり、返答は途中のまま残る。続きは利用者が頼む
  - PDF には `max_content_tokens` が効かない（500 kB で約 125,000 トークン）。読んだ中身は同じ実行の続くステップで送り直されて積み上がるので、何本も読むと文脈の上限を超えた要求が 400 になり、実行はエラーで終わる。次のターンは最後のステップの入力トークン数で断るので、たくさん読んだターンのあとは、保存しない分だけ小さいのに 409 になりうる
  - `web_fetch` は Anthropic の cache を返すことがあり、最新の中身とは限らない。JavaScript で描くページは読めない

## 生成物のページ（/artifacts）

会話の外で、持ち主の生成物（UI とスライド）を一覧し、版の履歴をたどり、版を公開・フォークする画面（`app/(authenticated)/artifacts/`）。画面の文言（ToolNav・見出し・一覧・案内など）では「作ったもの」と呼ぶ。コードの名前は artifacts のまま。

- 一覧は `@sidebar/artifacts/layout` が描く（最新版を作った時刻の新しい順に 100 件まで）。チャットと同じく layout に置き、生成物を移っても作り直さない。公開中のものには「公開」の印を付ける
- `/artifacts` の本文は、生成物のあるなしで分けない固定の案内で、DB を読まない。スマホでは一覧が Drawer の中にあり、本文が空に見えないようにするため
- `/artifacts/[artifactId]` は、DB の全版を履歴の列に並べ、`?v=N` で版を選ぶ（無ければ最新版）。`v` が 1 以上の整数として読めなければ 404 にする。ほかの会話でできた版や、カードの無い版も並ぶ。会話でできた版には、その会話（`/chat/<threadId>`）へのリンクを出す。フォークでできた版には、フォーク元の版（`/artifacts/<元の artifactId>?v=<版>`）へのリンク（「「<元のタイトル>」の版 M からフォーク」）を出す。元の生成物からフォーク先へのリンクは出さない
- 本文は会話のペインと同じ `ArtifactBody` で描き、版ごとに作り直す。`?v=` を移っても読み込みの骨組みには置き換わらず、ビューと xl 未満のタブの state は残る。次の版が届くまでは、押した履歴の行の背景を変える（`useLinkStatus`）。xl 以上は本文と履歴の2列、xl 未満はタブ（ビューと「履歴」）で1枚ずつ出す。隠すのは CSS（`data-shown`）で、本文はアンマウントしない
- スライドでは、見出しの「PDF出力」がブラウザの印刷を開き、選んでいる版の全スライドを PDF にする。本文の `DeckPreview` を `printable` で描き、Markdown のビューや「履歴」のタブを出しているあいだも CSS で隠すだけなので、そのまま印刷できる
- 見出しの鍵のアイコンのメニュー（`ArtifactShareMenu`）で、選んでいる版を公開する。公開中なら、別の版を選んでいるときは公開する版をその版に変え（リンクは変わらない）、リンクをコピーし、確かめのダイアログを通して非公開にする。公開している版は、履歴の行の「公開中」の印と、コピーの項目名（「版 M のリンクをコピー」）で示す。xl 未満では履歴の列が隠れ、アイコンの Tooltip もメニューとぶつかるので切っているため。公開・公開する版の変更・非公開の action は、書けなかったときも `refresh()` を呼び、見出し・履歴・一覧の印を同じ往復で描き直すので、公開の状態はクライアントに持たない。別のタブで取り消したあとの古い画面から公開する版を変えようとすると、公開し直さずに「公開は取り消されています」と知らせ、非公開の画面に描き直す
- 公開したリンクは、メニューを押した操作の中で、公開が終わるとリンクになる Promise を `ClipboardItem` に渡して写す。公開を待ってから写すと押した操作の外になり、Safari などでは写せないため。写せなかったときは、公開できたことだけを知らせる
- 見出しのフォークのボタン（`ArtifactForkButton`）で、選んでいる版を版 1 にした新しい生成物を作り、そのページへ移る。タイトルには「（フォーク）」を付ける。公開の状態は写さない。action は `revalidatePath('/artifacts', 'layout')` のあとに `redirect` する。一覧は共有の layout にあり、生成物を移るだけでは取り直されないため。フォークできたときは action の Promise が redirect のエラーで reject されるので、ボタンは `unstable_rethrow` が投げ直したものを受けたときだけ「フォークしました」と知らせ、それを Next に返す。押したボタンは移った先でアンマウントされてフォーカスが body に落ち、作ったもののページの title も変わらず移動が読み上げられないため、成功も Toast で知らせる。Toast はルートの `AppProvider` にあるので、移ったあとも残る。action がフォークせずに戻ったときと、redirect でないもので reject されたとき（サーバーの action が例外で終わった、応答が RSC でないなど）は失敗を知らせる。回線が切れたときは、Next（`experimental.useOffline`）が戻るまで待って送り直すので、押した状態のまま待つ
- 会話の外から Claude に直させる口は、見出しの「新しいチャットで直す」だけ。選んでいる版を土台にする書き出し（`UI「<タイトル>」（artifactId: <id>）の版 <N> を土台に、`。スライドなら「スライド」）を `/chat?draft=` で新しいチャットの入力欄に入れ、続きは利用者が書いて送る。書き出しは利用者の発言として送られるので、system・tools・履歴の形は変わらない。フォークした生成物も会話に属さないので、Claude に直させるときはこの口を使う
- 一覧も履歴も DB をキャッシュせずに読む。ただしブラウザの戻る・進むでは、Next がクライアントのキャッシュから画面を戻すので、そのあいだに足された生成物や版は出ない
- 履歴は、一覧や履歴のリンクで開き直すと新しくなる。一覧（`@sidebar/artifacts/layout`）は共有の layout なので、`/artifacts` の中を移っても取り直されない（フォークで移るときだけは、action が取り直させる）。ほかのツールへ移ってから ToolNav などのリンクで入り直すか、再読み込みすると新しくなる

## 公開ページ（/s/[slug]）

公開した UI とスライドを、ログインしていない閲覧者に見せる画面（`app/s/[slug]/`）。proxy の公開パスなので認証を通さない。匿名で叩ける URL なので、読み取りだけにして server action を置かない。

- slug が生成物の公開の形（16 文字の base64url）でなければ、DB を引かずに 404 にする（`share/interface/queries.ts`）
- 生成物の公開は、slug から公開している版の id を引くところをキャッシュしない。タグの無効化はインスタンスの中だけで効くので、取り消しをどのインスタンスでもすぐ効かせるため。版の中身とハイライトは、版の id ごとに `'use cache'`（`cacheLife('max')`）で持つ。版の行は書き換えないので古くならず、タグで無効化しない
- generateMetadata と本文の読み取りは、`React.cache` で1回の要求の中の1回にまとめる。見つからないときは stream が始まったあとの `notFound()` なので、200 のまま noindex の 404 の画面になる
- 送るのはタイトルと中身だけ（`PublicShare`）。生成物の id・版の id と番号・依頼・要約は送らない。取り消したら URL ごと捨てられるよう、slug を生成物の id と分けているため
- UI は `SpecPreview` で描き、生成 UI のリンクとフォームは動く
- スライドは `SharedDeck` が `DeckPreview` を `printable` で描き、見出しの「PDF出力」で印刷できる
  - 発表者ノートはサーバーで外してから送る。生成の system は、ノートは画面に出ないと伝えて書かせているため。画面にも PDF にも出ない
  - コードブロックのハイライトは、サーバーでノートを外したデッキから、2つのテーマ分を `{ lang, code, light, dark }` の列で作る。テーマは閲覧者のブラウザで決まるため。`SharedDeck` は、テーマに合わせて、受け取ったブロックを言語とコードで引いて当て、無ければプレーンにする。コードブロックはハイライトのトークンで本文を描くので、並び順で当てると、並びがずれたときに別のコードが出るため
- 取り消しても、Slack などに貼ったときの展開（タイトルと説明）と、閲覧者が開いたままの画面や保存した PDF は残る

## 認証 & コスト保護

Better Auth + GitHub OAuth（`@repo/ai-database/auth`）。**本人のみ**利用可（`ALLOWED_EMAILS`）。

LLM（Claude API）は課金が発生するため、**課金が発生する全 API route / server action の先頭で `shared/auth/require-allowed-session.ts` を呼び、未許可は弾く（API route は 401 を返し、server action は null・空配列・false などを返す）**こと（`src/proxy.ts` は matcher で `/api` を外しているため必須の防御層）。

認証の実装は `@repo/auth-shell`（`packages/auth-shell/CLAUDE.md`）にある。認証まわりを直すときはそちらを直し、ai 側にコピーを作らない。認証の有効/無効は `@repo/auth-shell/auth-enabled` に集約。Vercel preview は認証OFF（= preview URL は課金の開き戸になるため、ai プロジェクトには Vercel Deployment Protection を併用する）。

ローカル開発URLは `https://ai.k8o.localhost/`。`LOCAL_AUTH_BYPASS=true`（`.env.local`, NODE_ENV=development のときのみ）でログインを省略できる。

## 利用回数と予算

生成回数の上限（アプリと利用者ごとに1時間あたり `AI_GENERATE_LIMIT_PER_HOUR` 回）と月の予算（UTC の月初からの全行の費用の合計が $100 未満）は `ai_usages` の行で数える。`/api/chat` は、Claude を呼ぶ前に `reserveUsage`（`usage/application/usage.ts`）で行を予約し、予約できなければ 429 で断る。`reserveUsage` を通さずに Claude を呼ばない。トークン数と費用は `recordUsage` で、予約した行へあとから書き込む。単価は `usage/application/pricing.ts` にある。

- 行は、アプリ（`app`。書く値は `'agent'` だけ）と、Claude を呼んだ種類（`kind`）を持つ。`/api/chat` は `app: 'agent'`・`kind: 'generation'` で予約する
- 費用には、Claude API の web 検索の代金（1回 $0.01。結果の件数によらない）を足す。回数はステップの結果に届いた `web_search` の数で数え、エラーになった検索は課金されないので数えない。回数の列は持たず、費用に含めるだけにする。予算の判定は費用の合計しか見ないため
- `generate_ui` と `generate_slides` は、tool の中で Claude を呼ぶたびに `app: 'agent'` と、それぞれ `kind: 'ui'`・`kind: 'slides'` で別に予約し、tool が返る前に usage を書き終える。断られても 429 にはならず、断りの文言（`USAGE_REFUSAL_MESSAGES`）で tool のエラーになる。1時間の枠なら会話は続き、予算ならそのステップのあとの確かめで止まる
- 1時間の上限は、種類で絞らずに、アプリと利用者ごとの全行を数える
- 予算は、アプリと利用者で絞らずに数える
- エージェントは、tool を呼んだステップのあとにも予算を確かめて止まる。同時に走る実行はどれも予約を通れるので、予算を超えるのは、同時の実行の数 × 1ステップ分まで
- 1ステップで並べた `generate_ui`・`generate_slides` も、どれも同じ時点の予算を見て予約を通る。そのため、1ステップで並べた `generate_ui` の数 × 最大2回分（修復を含む）と `generate_slides` の数 × 1回分の生成まで、さらに予算を超えうる。歯止めは1時間の枠
- 予算に数えないもの
  - preview（`ai-preview` の DB）の分。本番とは別に数える
  - api の記事の要約。`ANTHROPIC_API_KEY` は Vercel の Shared Environment Variables で api と共有しているが、api の分は `ai_usages` に載らない
  - 中断したステップと、途中でエラーになったステップの usage。記録されずに欠けることがある。`generate_ui`・`generate_slides` の中の呼び出しは、`anthropic.message_start` が持つ入力と cache のトークンだけを記録し、出力の分が欠ける
- 最後の歯止めは、キーに紐づいたサブスクの月のクレジット。使い切ると API が止まり、請求はされない。ai 専用のキーや Anthropic Console の支出上限は置いていない

## Storybook MCP

ai の Storybook は Chromatic に公開しておらず、`.mcp.json` にも Storybook MCP を登録していない。@k8ordo/ui の props は `apps/ai/node_modules/@k8ordo/ui/docs/` を参照（propsを推測で使わない方針はルートのCLAUDE.md「UI共通」どおり）。

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
