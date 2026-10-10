# apps/api CLAUDE.md

k8o の API。Hono で書き、Vercel にデプロイする（本番ドメイン `api.k8o.me`）。Vercel Cron で動く定期同期、オーナーが Claude Code から使う MCP（`/mcp`）、k8o.me のブラウザから呼ぶ公開ルート（`/public/*`）を持つ。

## レイヤー構成（src/）

- `index.ts` … Hono アプリの入口。ルートを束ね、`shared/auth/require-bearer-secret.ts` で `/cron/*` に `CRON_SECRET`、`/mcp` に `MCP_TOKEN` の Bearer 検証をかける。`/public/*` は認証の無い公開ルート（`public.ts`）
- `mcp.ts` … MCP サーバーの組み立て。各 feature の tool を登録する
- `features/<feature>/interface/` … HTTP 境界（`cron-routes.ts`・`public-routes.ts`）と MCP の tool（`mcp-tools.ts`）、通知の配線などユースケースの組み立て
- `features/<feature>/application/`・`infrastructure/` … 分け方は apps/main と同じ（`apps/main/CLAUDE.md`）
- `shared/` … アプリ内で横断利用する処理

## cron

`vercel.json` の `crons` が `/cron/sync-articles`（00:00 UTC）と `/cron/sync-browser-support`（06:00 UTC）を叩く。`/cron/sync-articles` は RSS の取り込みと OGP の補完のあと、未要約の記事を Claude で要約する。1回の件数と経過時間で打ち切り、残りは翌日に回す。進み具合は MCP の `get_overview` で見る（Hobby の Vercel のログは1時間で消える）。`/cron/sync-browser-support` は `trigger=monitor|manual` と `force=true` も受け、外形監視（`.github/workflows/browser-support-monitor.yml`）の自走復旧と、workflow_dispatch からの強制再同期に使われる。

## 公開ルート

`/public/*` は k8o.me のブラウザから直接呼ぶ匿名の書き込み（`src/public.ts`）。main は `@repo/api/public` から `PublicApi` の型だけを読み、`apps/main/src/shared/api/public-api.ts` の hc（`hono/client`）で呼ぶ（パスの `/public` は型に含まれる）。向け先は本番が `https://api.k8o.me`、ローカルは同じ worktree の api。main の CSP の `connect-src` に api の origin が要る。

- ルートは `features/<feature>/interface/public-routes.ts` に書き、`src/public.ts` で束ねる。公開ルートのモジュールから MCP・cron・AI SDK を import しない（main の型検査に巻き込まれるため）
- 許可する Origin は k8o.me と www.k8o.me だけ。dev サーバー（`NODE_ENV=development`）では、ローカルの main（`https://(<ブランチ>.)main.k8o.localhost(:ポート)`）も許可する。main の preview からは書き込めない。cors は許可しない Origin を拒否しないので、フォームと同じ扱いになる POST（本文なしを含む）は csrf で、JSON はブラウザのプリフライトで止める。どちらもブラウザ外からの呼び出しには効かない
- 検証は zod/mini を `hono/validator` の中で呼ぶ。ルートが返すエラーは `{ ok: false, error: '<code>' }` とステータスだけにし、利用者に見せる文言は main に置く。ミドルウェアと hono 自身が返すエラー（csrf の 403、未定義のパスの 404、壊れた JSON の 400）はテキストで返るので、呼ぶ側は `res.ok` で成否を見る
- 本文は 64KB まで。想定外の例外は中身を出さずに 500 を返す

## MCP

`/mcp` は Streamable HTTP の MCP サーバー（`@modelcontextprotocol/server`）。オーナーが Claude Code から使う前提で、ルートの `.mcp.json` の `k8o-api` が `headersHelper` でルートの `fnox.toml` からトークン（`K8O_API_MCP_TOKEN`）を取って接続する。トークンを入れ替えるときは、ルートの `fnox.toml` と Vercel の `MCP_TOKEN` を同じ値にそろえる。

- tool を足すときは `features/<feature>/interface/mcp-tools.ts` に `register*Tools` を書き、`mcp.ts` で登録する
- スキーマは `zod`（classic）で書く。SDK が JSON Schema を取り出すのに classic 版の機能を使うため、`zod/mini` では型が通らない
- 第三者が書いた文字列（お問い合わせ本文やレポートなど）は `shared/mcp/untrusted-text.ts` を通し、フィールド名か説明でデータとして扱うよう明示する
- 公開ページを変える tool には `_meta['anthropic/requiresUserInteraction']` を付け、毎回確認させる
- 第三者の文章への対策で強制力があるのは、この確認だけ。お問い合わせやレポートを読むセッションでは auto mode を使わず、外部へ書き込める tool に確認を挟む
- tool 内の例外は SDK が `isError` の結果に変えて返すので、Vercel のログには残らない。失敗は会話の中で気づく
- リポジトリ層（SQL）は自動テストの対象外。変更したら本番の MCP で読み取りの tool を実行して確かめる

## ビルド・検証

```bash
pnpm -F @repo/api test         # ルートは app.request、MCP は SDK のクライアントで検証する
pnpm -F @repo/api type-check
pnpm -F @repo/api build        # vp pack で dist/index.mjs に束ねる
```

ローカルでは `pnpm run dev` で main・ai と一緒に起動する（portless の `api.k8o`。worktree ではブランチ名が前に付く）。`src/dev.ts` を tsx と `@hono/node-server` で動かし、環境変数は `apps/api/.env.local` から読む（`.env.example` を写す。DB はローカルの turso）。`src/dev.ts` は Vercel が入口として探す名前（app・index・server）にしない。デプロイは `.github/workflows/vercel-prebuilt.yml`（matrix の `api`）が行う。Vercel に設定する環境変数は `.env.example` にある。
