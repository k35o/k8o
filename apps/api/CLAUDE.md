# apps/api CLAUDE.md

k8o の API。Hono で書き、Vercel にデプロイする（本番ドメイン `api.k8o.me`）。Vercel Cron で動く定期同期と、オーナーが Claude Code から使う MCP（`/mcp`）を持つ。

## レイヤー構成（src/）

- `index.ts` … Hono アプリの入口。ルートを束ね、`shared/auth/require-bearer-secret.ts` で `/cron/*` に `CRON_SECRET`、`/mcp` に `MCP_TOKEN` の Bearer 検証をかける
- `mcp.ts` … MCP サーバーの組み立て。各 feature の tool を登録する
- `features/<feature>/interface/` … HTTP 境界（`cron-routes.ts`）と MCP の tool（`mcp-tools.ts`）、通知の配線などユースケースの組み立て
- `features/<feature>/application/`・`infrastructure/` … 分け方は apps/main と同じ（`apps/main/CLAUDE.md`）
- `shared/` … アプリ内で横断利用する処理

## cron

`vercel.json` の `crons` が `/cron/sync-articles`（00:00 UTC）と `/cron/sync-browser-support`（06:00 UTC）を叩く。`/cron/sync-browser-support` は `trigger=monitor|manual` と `force=true` も受け、外形監視（`.github/workflows/browser-support-monitor.yml`）の自走復旧と、workflow_dispatch からの強制再同期に使われる。

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

ローカルの dev サーバーは持たない。デプロイは `.github/workflows/vercel-prebuilt.yml`（matrix の `api`）が行う。Vercel に設定する環境変数は `.env.example` にある。
