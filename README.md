# k8o

k8oが作成したすべてのコンテンツを公開するウェブサイトです。

## クイックスタート

```bash
pnpm i --frozen-lockfile

# 環境変数設定（URLは https://<name>.k8o.localhost を使う。ポート番号は不要）
cp apps/main/.env.example apps/main/.env.local
cp apps/admin/.env.example apps/admin/.env.local
cp packages/database/.env.example packages/database/.env.local

# ローカルHTTPS用のCA証明書をシステムに登録（初回のみ）
pnpm portless trust

# Nodeが portless の自己署名CAを信頼するよう環境変数を設定
# `drizzle-kit migrate` などの Node クライアントが https://*.localhost を叩く際に必要
# 永続化したい場合は ~/.zshrc などに追記する
export NODE_EXTRA_CA_CERTS=$HOME/.portless/ca.pem

# 開発サーバー起動（proxy + main/admin + DB。DB は未起動なら起動・起動済みなら再利用）
pnpm run dev

# マイグレーション（pnpm dev 実行中に別ターミナルで実行）
pnpm run -F @repo/database migrate
```

### ローカルDB(turso)

ローカルの turso(libSQL) は `pnpm dev` 実行時に自動で立ち上がる（`packages/database/scripts/local-db.ts` / Node のネイティブTS実行）。

- DB が**未起動なら起動、起動済みなら再利用**（二重起動しない）
- `db.k8o.localhost` を 38787（`K8O_DB_PORT` で上書き可）に固定で割り当て、全 worktree が main checkout の `packages/database/local.db` を共有する
- DB を起動した `pnpm dev` を止めると DB も止まる。別 worktree の dev が使っていて落ちた時などは、気づいた人が `pnpm dev` か下記で立ち上げ直す

```bash
pnpm -F @repo/database db:serve    # 単発で turso を起動（停止は Ctrl-C）
pnpm -F @repo/database db:status   # 稼働状況の確認
```

## アーキテクチャ

**Turborepo Monorepo**:

- `apps/main` - Next.js (App Router)
- `apps/admin` - Next.js 管理サイト (Better Auth + GitHub OAuth)
- `packages/database` - Drizzle ORM + Turso (libSQL)
- `packages/helpers` - ユーティリティ関数
- `@k8o/arte-odyssey` - UIコンポーネント ([npm](https://www.npmjs.com/package/@k8o/arte-odyssey))

**apps/main / apps/admin の配置方針**:

- `app/` - App RouterのentryとUI。UIコンポーネントは `app/**/_components`
- `features/` - 機能単位の非UIロジック。`interface` / `application` / `infrastructure` に分ける
- `shared/` - アプリ内で横断利用する非UI共通処理
- `packages/helpers` - アプリ非依存の純粋helper。`cn` もここに置く

`@repo/database` の import 境界は、oxc 移行時に lint ルールとして固定する予定です。現時点では `app` から直接 DB を読まず、`features/*/interface` か `features/*/application` に寄せます。

## 本番環境

- **Hosting**: [Vercel](https://vercel.com)
- **Database**: [Turso](https://turso.tech) (libSQL)
