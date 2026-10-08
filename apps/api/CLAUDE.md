# apps/api CLAUDE.md

k8o の API。Hono で書き、Vercel にデプロイする（本番ドメイン `api.k8o.me`）。今は Vercel Cron で動く定期同期だけを持つ。

## レイヤー構成（src/）

- `index.ts` … Hono アプリの入口。ルートを束ね、`/cron/*` に `shared/auth/require-cron-secret.ts`（`CRON_SECRET` の Bearer 検証）をかける
- `features/<feature>/interface/` … HTTP 境界（`cron-routes.ts`）と、通知の配線などユースケースの組み立て
- `features/<feature>/application/`・`infrastructure/` … 分け方は apps/main と同じ（`apps/main/CLAUDE.md`）
- `shared/` … アプリ内で横断利用する処理

## cron

`vercel.json` の `crons` が `/cron/sync-articles`（00:00 UTC）と `/cron/sync-browser-support`（06:00 UTC）を叩く。`/cron/sync-browser-support` は `trigger=monitor|manual` と `force=true` も受け、外形監視（`.github/workflows/browser-support-monitor.yml`）の自走復旧と、workflow_dispatch からの強制再同期に使われる。

## ビルド・検証

```bash
pnpm -F @repo/api test         # ルートは app.request で検証する
pnpm -F @repo/api type-check
pnpm -F @repo/api build        # vp pack で dist/index.mjs に束ねる
```

ローカルの dev サーバーは持たない。デプロイは `.github/workflows/vercel-prebuilt.yml`（matrix の `api`）が行う。Vercel に設定する環境変数は `.env.example` にある。
