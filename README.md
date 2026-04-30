# k8o

k8oが作成したすべてのコンテンツを公開するウェブサイトです。

## クイックスタート

```bash
pnpm i --frozen-lockfile

# 環境変数設定
cp apps/main/.env.example apps/main/.env.local
cp packages/database/.env.example packages/database/.env.local

# ローカルHTTPS用のCA証明書をシステムに登録（初回のみ）
pnpm portless trust

# マイグレーション & 開発サーバー起動
pnpm run -F @repo/database migrate
pnpm run dev
```

## アーキテクチャ

**Turborepo Monorepo**:

- `apps/main` - Next.js (App Router)
- `packages/database` - Drizzle ORM + Turso (libSQL)
- `packages/helpers` - ユーティリティ関数
- `@k8o/arte-odyssey` - UIコンポーネント ([npm](https://www.npmjs.com/package/@k8o/arte-odyssey))

**apps/main の配置方針**:

- `app/` - App RouterのentryとUI。UIコンポーネントは `app/**/_components`
- `features/` - blog/tags/talksなど機能単位の非UIロジック
- `shared/` - mainアプリ内で横断利用する非UI共通処理
- `packages/helpers` - アプリ非依存の純粋helper。`cn` もここに置く

## 本番環境

- **Hosting**: [Vercel](https://vercel.com)
- **Database**: [Turso](https://turso.tech) (libSQL)
