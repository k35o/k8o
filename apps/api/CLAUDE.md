# apps/api CLAUDE.md

k8o の API。Hono で書き、Vercel にデプロイする（本番ドメイン `api.k8o.me`）。Vercel Cron で動く定期同期、オーナーが Claude Code から使う MCP（`/mcp`）、ai などオーナーのアプリから呼ぶオーナー API（`/owner/*`）、k8o.me のブラウザから呼ぶ公開ルート（`/public/*`）を持つ。

## レイヤー構成（src/）

- `index.ts` … Hono アプリの入口。ルートを束ね、`shared/auth/require-bearer-secret.ts` で `/cron/*` に `CRON_SECRET`、`/mcp` に `MCP_TOKEN`、`/owner/*` にクライアントごとのトークンの Bearer 検証をかける。`/owner/*` は `owner.ts`、`/public/*` は認証の無い公開ルート（`public.ts`）
- `mcp.ts` … MCP サーバーの組み立て。各 feature の tool を登録する
- `features/<feature>/interface/` … HTTP 境界（`cron-routes.ts`・`owner-routes.ts`・`public-routes.ts`）と MCP の tool（`mcp-tools.ts`）、通知の配線などユースケースの組み立て。repository や外への接続は直に読まず、application の関数を呼ぶ
- `features/<feature>/application/` … ユースケースと整形。小さい読み取りはここに置いてよい
- `features/<feature>/infrastructure/` … DB の読み書きと、外への接続（RSS・OGP・Claude・Web Push など）の詳細。処理が太くなったら application からここへ切り出す
- `shared/` … アプリ内で横断利用する処理

## cron

`vercel.json` の `crons` が `/cron/sync-articles`（00:00 UTC）と `/cron/sync-browser-support`（06:00 UTC）を叩く。`/cron/sync-articles` は記事を取り込み（OGP の画像と説明は取り込むときに 1 回だけ取る）、未要約の記事を Claude で要約する。取り込むソース（`article_sources`）は 4 種類で、`feed` は RSS、`browser-releases` は browser-compat-data の版の一覧（`browsers/<ブラウザ>.json`）から、出荷済みの版ごとに「Chrome 158」のような 1 件を作り、リンクはその版のリリースノートにする（Chrome・Firefox のリリースノートには RSS が無い）。`devsite-blog` は developer.chrome.com・web.dev のブログの一覧のページが読む非公開の API（`/_d/dynamic_content`）から作る（両方の RSS が更新されない）。応答の形が変わったら、そのソースの取り込みを失敗にして通知に出す。`github-releases` は GitHub のリポジトリの `releases.atom` から、最新のメジャーの系統のマイナー以上の版を「Zod 4.6」のような 1 件にする（題の頭はソースの名前）。パッチ・プレリリース・古い系統・同じリポジトリの別のパッケージの版は出さない。版はタグから読み、タグの頭は既定で `v`、違うリポジトリは URL のフラグメントで指定する（`…/releases.atom#oxlint_v`）。フィードには最新の 10 件しか載らないので、1 日に 10 件を超えて版を出すリポジトリ（AI SDK など）には使わない。`feed` の項目のリンクがページの中の場所（`#…`）を指すとき（Claude Code・Claude Platform の変更履歴）は、ページにほかの項目も載っているので、OGP を取らず、フィードの項目の本文を `body` に残して要約はそれを読む。題が日付のように項目の間で重なるフィードは、本文の最初の文を題にする。ソースはマイグレーションで足す。本番にはマイグレーションの外で登録したソースもあるので、登録済みの一覧は MCP の `list_article_sources` で見る（公開ルートには出さない）。developer.apple.com のドキュメントは JavaScript で描くページなので、要約の本文は同じ中身の JSON から読む。1回の件数と経過時間で打ち切り、残りは翌日に回す。そのあと、日本時間で前日までの日ごとに、その日のまとめを Claude（Opus 5.5）で作る（`reading_digests`）。その日の記事を取り込み終えてから作るので、当日の分は翌朝の同期で作る。まとめは、その日の全体像の文、特に見てほしい記事（0〜3 件と理由）、残りの記事を束ねた話題（性質・1 文の見出し・記事の id）で、記事はどちらか 1 か所にだけ入る。何を大きいとするかの物差しは `digest-writer.ts` の指示に書く。まとめの無い日を新しい日から 1 回に 10 日分まで作り、直近 3 日は記事が増えていたら作り直す。Readings（`GET /public/reading-list` とその RSS）は、同期の時刻の日本時間 9 時を境に前日までの日だけを出す。当日の記事は、翌朝の同期で取り込み終えてから、その日のまとめと一緒に出る。`GET /public/reading-list` は、記事をその日のまとめに入れた `days`（全体像・見てほしい記事・話題と、それぞれの記事）を返す。記事は要約か元の記事の説明のどちらかを本文（`text`）に持つ。まとめのどこにも入らなかった記事は「そのほかの記事」に、まとめの無い日の記事は「この日の記事」の話題にまとめる。進み具合は MCP の `get_overview` かオーナー API の `GET /owner/overview` で見る（Hobby の Vercel のログは1時間で消える）。`/cron/sync-browser-support` は `trigger=monitor|manual` と `force=true` も受け、外形監視（`.github/workflows/browser-support-monitor.yml`）の自走復旧と、workflow_dispatch からの強制再同期に使われる。外形監視は `GET /public/browser-support/health` で同期の状態を読む。

## 公開ルート

`/public/*` は k8o.me のブラウザから直接呼ぶ匿名の書き込みと、公開データの読み取り（`src/public.ts`）。main は `@repo/api/public` から `PublicApi` の型だけを読み、`apps/main/src/shared/api/public-api.ts` の hc（`hono/client`）で呼ぶ（パスの `/public` は型に含まれる）。向け先は本番が `https://api.k8o.me`、ローカルは同じ worktree の api。main の CSP の `connect-src` に api の origin が要る。

- ルートは `features/<feature>/interface/public-routes.ts` に書き、`src/public.ts` で束ねる。公開ルートのモジュールから MCP・cron・AI SDK を import しない（main の型検査に巻き込まれるため）
- 書き込み（POST・DELETE とそのプリフライト）で許可する Origin は k8o.me と www.k8o.me だけ。dev サーバー（`NODE_ENV=development`）では、ローカルの main（`https://(<ブランチ>.)main.k8o.localhost(:ポート)`）も許可する。main の preview からは書き込めない。cors は許可しない Origin を拒否しないので、フォームと同じ扱いになる POST（本文なしを含む）は csrf で、JSON はブラウザのプリフライトで止める。どちらもブラウザ外からの呼び出しには効かない
- 検証は zod/mini を `hono/validator` の中で呼ぶ。エラーは `{ ok: false, error: '<code>' }` とステータスだけにし、利用者に見せる文言は main に置く。hono の csrf の 403（`forbidden`）と壊れた JSON の 400（`invalid_request`）は `shared/http/error-handler.ts` が、未定義のパスの 404（`not_found`）は `index.ts` の `notFound` が同じ形にする
- 本文は 64KB まで。想定外の例外は中身を出さずに 500 を返す
- 読み取りは GET（と HEAD）で、日々変わる表示の最新値を返す。`GET /public/browser-support` は表示する機能・最近の更新・選んだ時刻、`GET /public/browser-support/features/:featureId` は1機能の状態（旧い ID も解決する）、`GET /public/browser-support/recent-changes` は直近30日の最近の更新（`recentChanges`）だけを返す。`GET /public/reading-list` は直近90日のうち日本時間 9 時を境に前日までの記事を、日ごとのまとめに組み立てた `days` を、`GET /public/reading-list/latest` はそのうちまとめのある最新の日を、`days` の 1 日と同じ形の `day` で返す（無ければ null）。`GET /public/reading-list/feed` は reading-list の RSS で、まとめのある日を 1 日 1 件で配る。本文はその日の全体像・見てほしい記事・話題の見出しの HTML で、リンクは `https://k8o.me/reading-list#<日付>`。self は `https://k8o.me/reading-list/feed`。k8o.me の `/reading-list/feed` は main の `vercel()` の規則（`apps/main/src/site/vercel-routes.ts`）がこの GET を中継する。`GET /public/push-logs` は通知の履歴を新しい順に返す。`GET /public/browser-support/health` は外形監視が読む同期の状態で、30時間以内に同期が成功し active のデータがあれば `ok` を 200 で、そうでなければ `stale` を、DB を読めなければ `degraded` を 503 で返す。active のフロア（`minVersions`）も返し、監視はそれをリポジトリの `browser-min-versions.json` と比べる。main は browser-support と通知の履歴をビルド時の値で描き、ブラウザで `/browser-support` は `GET /public/browser-support`、記事の `<BrowserSupportStatus>` は `GET /public/browser-support/features/:featureId`、`/notifications` は `GET /public/push-logs` の値に差し替える。`/reading-list` はビルド時の値を持たず、ブラウザで `GET /public/reading-list` を読んで描く。ホームの Readings と Baseline の動きも、ビルド時の値を持たず、ブラウザで `GET /public/reading-list/latest` と `GET /public/browser-support/recent-changes` を読んで描く
- 読み取りの CORS は Origin を問わず `Access-Control-Allow-Origin: *` を返し、`Vary: Origin` を付けない。読むのは k8o.me に出ている公開のデータだけで、preview の main からも読める
- 読み取りは query を受けず、query 付きの GET・HEAD は 400 の `invalid_request` にする。CDN は query を含めた URL でキャッシュするので、query を変えるだけでキャッシュを外して DB に届かせられるため。`/public/reading-list/feed` だけは、query 付きの GET・HEAD を DB に届かせずに query の無い `https://k8o.me/reading-list/feed` へ 308 で戻す。フィードはその URL（self）で配り、購読者やリーダーが付けた query でも取れる必要があるため
- 読み取りの Cache-Control はルートが `shared/cache/public-cache-control.ts` で付ける（Vercel の CDN が `s-maxage`・`stale-while-revalidate`・`stale-if-error` を解釈する）。データで決まる 404（無い featureId）も 200 と同じだけ持たせる。health は監視がいつも今の状態を読むので `no-store` にする。ルートが付けなかった応答（400・500・未定義のパスの 404）も `no-store` になる。`GET /public/reading-list`・`GET /public/reading-list/latest`・`GET /public/reading-list/feed` は本文から作った ETag（hono の `etag`）を付け、`If-None-Match` が合えば本文なしの 304 を返す。304 にも Cache-Control と ETag を残し、`W/` の付いた ETag でも合う
- 読み取りの応答の形は、項目を足すだけにする。api と main は並列にデプロイされ、main が先に出ると古い api の応答を読むので、main の client が読む項目を足すときは api の PR を先に本番へ出し、main の PR はそのあとにマージする。api を Instant Rollback するときは、戻す先に無い項目を main が読んでいないかを見る
- `/public/reports` は、main の Reporting-Endpoints を通してブラウザの Reporting API が送る CSP 違反と、main のクライアントのエラーを受ける。Reporting API は `application/reports+json` の配列を送り、Chromium と Firefox は別オリジンなのでプリフライトを経る（Chromium は毎回）。410 は Firefox に送り先を消させるので、どの場合も返さない（Chromium は 2xx 以外をすべて送り直す）。Safari は CSP 違反を `application/csp-report` の単一オブジェクトで、プリフライトなしで送る。JSON 系の Content-Type でないので `validator('json')` が本文を読まず 400 になり、受けていない
- `/public/reports` は1件ごとに `type` 64字、`url` 2048字、`user_agent` 512字、`body` を JSON にして 8192字までを受け、超えたレポートは捨てる。1回のリクエストで保存するのは、残りのうち先頭の 50件まで。捨てたときも 204 を返す。配列でない・必須のキーが無いといった形の誤りは 400

## main のビルドが読む関数

`src/build-data.ts`（`@repo/api/build-data`）は、main のビルドが同じプロセスで呼ぶ読み取りの関数を export する。公開済みの記事・タグ・トークと、ビルド時に描く browser-support と通知の履歴の値を返す。トークの `slug` は、`deck_published_at` を過ぎたものだけを返す（`features/site-content/application/deck-publication.ts`）。トークを解説する記事（`blog`）は公開済みのものだけを返す。記事はトークを指さず、記事のスライドは main がトークの一覧から引く。公開ルートと同じく、ここから MCP・cron・AI SDK を import しない。main のビルドは同じコミットの関数を呼ぶので、形を変えるときは main も同じ PR で直す。

## オーナー API

`/owner/*` は、オーナーのアプリ（今は ai）がサーバーから呼ぶ読み取りの API（`src/owner.ts`）。ai は k8o の DB の資格情報を持たず、k8o のデータはここから読む。呼ぶ側は `@repo/api/owner` から `OwnerApi` の型だけを読み、hc で呼ぶ。

- トークンはクライアントごとに分ける。ai の本番は `OWNER_API_TOKEN_AI`、ai の preview は `OWNER_API_TOKEN_AI_PREVIEW` と同じ値を持ち、どちらも本番の api を呼ぶ。片方だけを入れ替え・失効できる。クライアントを足すときは環境変数を足して `index.ts` の `requireBearerSecret` に並べる
- ルートは `features/<feature>/interface/owner-routes.ts` に書き、`src/owner.ts` で束ねる。オーナー API のモジュールから MCP・cron・AI SDK を import しない（ai の型検査に巻き込まれるため）
- エラーは公開ルートと同じく `{ ok: false, error: '<code>' }` とステータスで返す。Bearer の検証に落ちたときは 401 の `unauthorized`
- `GET /owner/blogs` は記事の一覧、`GET /owner/blogs/:slug` は記事の markdown を返す。記事の本文とタイトルは main の MDX にあり DB には無いので、main の公開ページ（`https://k8o.me/blog/feed` と `https://k8o.me/blog/<slug>.md`）から取る。slug は `[a-z0-9-]` だけを受ける
- 管理データの口は、MCP の読み取りの tool と同じ関数を通し、同じ形を返す。`GET /owner/overview` は `get_overview`、`GET /owner/inquiries` は `list_inquiries`、`GET /owner/blog-stats`（記事ごとの閲覧数・フィードバックの件数・下書き）は `list_blog_stats`、`GET /owner/reports`（ブラウザからのレポート）は `list_reports` に当たる。入力は query で受ける。ページの番号と件数（記事は絞り込みと並び順も）は既定値を持たず、呼ぶ側が毎回渡す。件数の上限は MCP と同じで、形の誤りは 400 の `invalid_request`
- 第三者が書いた文（お問い合わせの本文、レポートの種別・URL・本文）は `shared/text/untrusted-text.ts` を通して返す。ai は、その文を返す口を読む tool の出力を保存しない（apps/ai の `WITHHOLDS_OUTPUT`）。保存する tool では api の値をそのまま残すので、第三者の文を返す項目をほかの口に足すときは、ai の分け方も見直す

## MCP

`/mcp` は Streamable HTTP の MCP サーバー（`@modelcontextprotocol/server`）。オーナーが Claude Code から使う前提で、ルートの `.mcp.json` の `k8o-api` が `headersHelper` でルートの `fnox.toml` からトークン（`K8O_API_MCP_TOKEN`）を取って接続する。トークンを入れ替えるときは、ルートの `fnox.toml` と Vercel の `MCP_TOKEN` を同じ値にそろえる。

- tool を足すときは `features/<feature>/interface/mcp-tools.ts` に `register*Tools` を書き、`mcp.ts` で登録する
- スキーマは `zod`（classic）で書く。SDK が JSON Schema を取り出すのに classic 版の機能を使うため、`zod/mini` では型が通らない
- 第三者が書いた文字列（お問い合わせ本文やレポートなど）は、オーナー API と同じく `shared/text/untrusted-text.ts` を通し、フィールド名か説明でデータとして扱うよう明示する
- tool は読み取りだけにする。記事の公開・非公開は `blogs.published` を書き換えるマイグレーションで行い、MCP からは変えない
- お問い合わせやレポートを読むセッションでは auto mode を使わず、外部へ書き込める tool に確認を挟む。第三者の文章への対策で強制力があるのは、この確認だけ
- tool 内の例外は SDK が `isError` の結果に変えて返すので、Vercel のログには残らない。失敗は会話の中で気づく
- リポジトリ層（SQL）は自動テストの対象外。変更したら本番の MCP で読み取りの tool を実行して確かめる

## ビルド・検証

```bash
pnpm -F @repo/api test         # ルートは app.request、MCP は SDK のクライアントで検証する
pnpm -F @repo/api type-check
pnpm -F @repo/api build        # vp pack で dist/index.mjs に束ねる
```

ローカルでは `pnpm run dev` で main・ai と一緒に起動する（portless の `api.k8o`。worktree ではブランチ名が前に付く）。`--filter=main` か `--filter=@repo/api` で絞っても、api とローカルの DB は一緒に立つ（各 app の `turbo.json` の `with`）。`src/dev.ts` を tsx と `@hono/node-server` で動かし、環境変数は `apps/api/.env.local` から読む（`.env.example` を写す。DB はローカルの turso）。`src/dev.ts` は Vercel が入口として探す名前（app・index・server）にしない。デプロイは `.github/workflows/vercel-prebuilt.yml`（matrix の `api`）が行う。Vercel に設定する環境変数は `.env.example` にある。
