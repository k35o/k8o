# apps/api CLAUDE.md

k8o の API。Hono で書き、Vercel にデプロイする（本番ドメイン `api.k8o.me`）。Vercel Cron で動く定期同期、オーナーが Claude Code から使う MCP（`/mcp`）、ai などオーナーのアプリから呼ぶオーナー API（`/owner/*`）、k8o.me のブラウザから呼ぶ公開ルート（`/public/*`）を持つ。

## レイヤー構成（src/）

- `index.ts` … Hono アプリの入口。ルートを束ね、`shared/auth/require-bearer-secret.ts` で `/cron/*` に `CRON_SECRET`、`/mcp` に `MCP_TOKEN`、`/owner/*` にクライアントごとのトークンの Bearer 検証をかける。`/owner/*` は `owner.ts`、`/public/*` は認証の無い公開ルート（`public.ts`）
- `mcp.ts` … MCP サーバーの組み立て。各 feature の tool を登録する
- `features/<feature>/interface/` … HTTP 境界（`cron-routes.ts`・`owner-routes.ts`・`public-routes.ts`）と MCP の tool（`mcp-tools.ts`）、通知の配線などユースケースの組み立て
- `features/<feature>/application/`・`infrastructure/` … 分け方は apps/main と同じ（`apps/main/CLAUDE.md`）
- `shared/` … アプリ内で横断利用する処理

## cron

`vercel.json` の `crons` が `/cron/sync-articles`（00:00 UTC）と `/cron/sync-browser-support`（06:00 UTC）を叩く。`/cron/sync-articles` は RSS の取り込みと OGP の補完のあと、未要約の記事を Claude で要約する。1回の件数と経過時間で打ち切り、残りは翌日に回す。進み具合は MCP の `get_overview` かオーナー API の `GET /owner/overview` で見る（Hobby の Vercel のログは1時間で消える）。`/cron/sync-browser-support` は `trigger=monitor|manual` と `force=true` も受け、外形監視（`.github/workflows/browser-support-monitor.yml`）の自走復旧と、workflow_dispatch からの強制再同期に使われる。外形監視は `GET /public/browser-support/health` で同期の状態を読む。

## 公開ルート

`/public/*` は k8o.me のブラウザから直接呼ぶ匿名の書き込みと、公開データの読み取り（`src/public.ts`）。main は `@repo/api/public` から `PublicApi` の型だけを読み、`apps/main/src/shared/api/public-api.ts` の hc（`hono/client`）で呼ぶ（パスの `/public` は型に含まれる）。向け先は本番が `https://api.k8o.me`、ローカルは同じ worktree の api。main の CSP の `connect-src` に api の origin が要る。

- ルートは `features/<feature>/interface/public-routes.ts` に書き、`src/public.ts` で束ねる。公開ルートのモジュールから MCP・cron・AI SDK を import しない（main の型検査に巻き込まれるため）
- 書き込み（POST・DELETE とそのプリフライト）で許可する Origin は k8o.me と www.k8o.me だけ。dev サーバー（`NODE_ENV=development`）では、ローカルの main（`https://(<ブランチ>.)main.k8o.localhost(:ポート)`）も許可する。main の preview からは書き込めない。cors は許可しない Origin を拒否しないので、フォームと同じ扱いになる POST（本文なしを含む）は csrf で、JSON はブラウザのプリフライトで止める。どちらもブラウザ外からの呼び出しには効かない
- 検証は zod/mini を `hono/validator` の中で呼ぶ。ルートが返すエラーは `{ ok: false, error: '<code>' }` とステータスだけにし、利用者に見せる文言は main に置く。ミドルウェアと hono 自身が返すエラー（csrf の 403、未定義のパスの 404、壊れた JSON の 400）はテキストで返るので、呼ぶ側は `res.ok` で成否を見る
- 本文は 64KB まで。想定外の例外は中身を出さずに 500 を返す
- 読み取りは GET（と HEAD）で、日々変わる表示の最新値を返す。`GET /public/browser-support` は表示する機能・最近の更新・選んだ時刻、`GET /public/browser-support/features/:featureId` は1機能の状態（旧い ID も解決する）、`GET /public/reading-list` は直近90日の記事とソースの一覧を返す。`GET /public/reading-list/feed` は reading-list の RSS で、self は `https://k8o.me/reading-list/feed`。k8o.me の `/reading-list/feed` は main の rewrites がこの GET を中継する。`GET /public/push-logs` は通知の履歴を新しい順に返す。`GET /public/browser-support/health` は外形監視が読む同期の状態で、30時間以内に同期が成功し active のデータがあれば `ok` を 200 で、そうでなければ `stale` を、DB を読めなければ `degraded` を 503 で返す。active のフロア（`minVersions`）も返し、監視はそれをリポジトリの `browser-min-versions.json` と比べる。main は browser-support・reading-list・通知の履歴をビルド時の値で描き、ブラウザで `/browser-support` は `GET /public/browser-support`、記事の `<BrowserSupportStatus>` とかどまるラボの対応状況は `GET /public/browser-support/features/:featureId`、`/reading-list` は `GET /public/reading-list`、`/notifications` は `GET /public/push-logs` の値に差し替える
- 読み取りの CORS は Origin を問わず `Access-Control-Allow-Origin: *` を返し、`Vary: Origin` を付けない。読むのは k8o.me に出ている公開のデータだけで、preview の main からも読める
- 読み取りは query を受けず、query 付きの GET・HEAD は 400 の `invalid_request` にする。CDN は query を含めた URL でキャッシュするので、query を変えるだけでキャッシュを外して DB に届かせられるため。`/public/reading-list/feed` だけは、query 付きの GET・HEAD を DB に届かせずに query の無い `https://k8o.me/reading-list/feed` へ 308 で戻す。フィードはその URL（self）で配り、購読者やリーダーが付けた query でも取れる必要があるため
- 読み取りの Cache-Control はルートが `shared/cache/public-cache-control.ts` で付ける（Vercel の CDN が `s-maxage`・`stale-while-revalidate`・`stale-if-error` を解釈する）。データで決まる 404（無い featureId）も 200 と同じだけ持たせる。health は監視がいつも今の状態を読むので `no-store` にする。ルートが付けなかった応答（400・500・未定義のパスの 404）も `no-store` になる
- 読み取りの応答の形は、項目を足すだけにする。api と main は並列にデプロイされ、main が先に出ると古い api の応答を読むので、main の client が読む項目を足すときは api の PR を先に本番へ出し、main の PR はそのあとにマージする。api を Instant Rollback するときは、戻す先に無い項目を main が読んでいないかを見る
- `/public/reports` は、main の Reporting-Endpoints を通してブラウザの Reporting API が送る CSP 違反と、main のクライアントのエラーを受ける。Reporting API は `application/reports+json` の配列を送り、Chromium と Firefox は別オリジンなのでプリフライトを経る（Chromium は毎回）。410 は Firefox に送り先を消させるので、どの場合も返さない（Chromium は 2xx 以外をすべて送り直す）。Safari は CSP 違反を `application/csp-report` の単一オブジェクトで、プリフライトなしで送る。JSON 系の Content-Type でないので `validator('json')` が本文を読まず 400 になり、受けていない
- `/public/reports` は1件ごとに `type` 64字、`url` 2048字、`user_agent` 512字、`body` を JSON にして 8192字までを受け、超えたレポートは捨てる。1回のリクエストで保存するのは、残りのうち先頭の 50件まで。捨てたときも 204 を返す。配列でない・必須のキーが無いといった形の誤りは 400

## オーナー API

`/owner/*` は、オーナーのアプリ（今は ai）がサーバーから呼ぶ読み取りの API（`src/owner.ts`）。ai は k8o の DB の資格情報を持たず、k8o のデータはここから読む。呼ぶ側は `@repo/api/owner` から `OwnerApi` の型だけを読み、hc で呼ぶ。

- トークンはクライアントごとに分ける。ai の本番は `OWNER_API_TOKEN_AI`、ai の preview は `OWNER_API_TOKEN_AI_PREVIEW` と同じ値を持ち、どちらも本番の api を呼ぶ。片方だけを入れ替え・失効できる。クライアントを足すときは環境変数を足して `index.ts` の `requireBearerSecret` に並べる
- ルートは `features/<feature>/interface/owner-routes.ts` に書き、`src/owner.ts` で束ねる。オーナー API のモジュールから MCP・cron・AI SDK を import しない（ai の型検査に巻き込まれるため）
- エラーは公開ルートと同じく `{ ok: false, error: '<code>' }` とステータスで返す
- `GET /owner/blogs` は記事の一覧、`GET /owner/blogs/:slug` は記事の markdown を返す。記事の本文とタイトルは main の MDX にあり DB には無いので、main の公開ページ（`https://k8o.me/blog/feed` と `https://k8o.me/blog/<slug>.md`）から取る。slug は `[a-z0-9-]` だけを受ける
- 管理データの口は、MCP の読み取りの tool と同じ関数を通し、同じ形を返す。`GET /owner/overview` は `get_overview`、`GET /owner/inquiries` は `list_inquiries`、`GET /owner/blog-stats`（記事ごとの閲覧数・フィードバックの件数・下書き）は `list_blogs`、`GET /owner/reports`（ブラウザからのレポート）は `list_reports` に当たる。入力は query で受ける。ページの番号と件数（記事は絞り込みと並び順も）は既定値を持たず、呼ぶ側が毎回渡す。件数の上限は MCP と同じで、形の誤りは 400 の `invalid_request`
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

ローカルでは `pnpm run dev` で main・ai と一緒に起動する（portless の `api.k8o`。worktree ではブランチ名が前に付く）。`src/dev.ts` を tsx と `@hono/node-server` で動かし、環境変数は `apps/api/.env.local` から読む（`.env.example` を写す。DB はローカルの turso）。`src/dev.ts` は Vercel が入口として探す名前（app・index・server）にしない。デプロイは `.github/workflows/vercel-prebuilt.yml`（matrix の `api`）が行う。Vercel に設定する環境変数は `.env.example` にある。
