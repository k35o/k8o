# k8o

k8oが作成したすべてのコンテンツを公開するウェブサイトです。

## クイックスタート

```bash
# 依存関係インストール(Node.js 24.12.0, pnpm 10.25.0)
pnpm i --frozen-lockfile

# 環境変数設定 & ローカルサービス起動
cp apps/main/.env.example apps/main/.env.local
# apps/main/.env.localにGITHUB_TOKENを設定(GitHub Contribution表示に必要)
# GitHub Personal Access Token (classic)をhttps://github.com/settings/tokensで取得
# 必要なスコープ: read:user
docker compose up -d
pnpm run -F @repo/database migrate

# 開発サーバー起動
pnpm run dev
```

## アーキテクチャ

**Turborepo Monorepo**:

- `apps/main` - Next.js 16 (App Router)
- `packages/database` - Drizzle ORM + PostgreSQL
- `packages/helpers` - ユーティリティ関数
- `@k8o/arte-odyssey` - UIコンポーネント([npm](https://www.npmjs.com/package/@k8o/arte-odyssey))

## ドキュメント

| ドキュメント | 内容 |
|-------------|------|
| [CLAUDE.md](./CLAUDE.md) | Claude Code向けリファレンス |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | 開発フロー・コード規約 |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | システム構成・設計思想 |
| [docs/](./docs/) | API、テスト、デプロイ等の詳細ガイド |

## コマンド

```bash
pnpm run dev              # 開発サーバー
pnpm run build            # ビルド
pnpm run test             # テスト
pnpm run check:write      # リント＆フォーマット
pnpm run -F main storybook # Storybook
```

詳細は[CLAUDE.md](./CLAUDE.md)を参照。

## 本番環境

- **Hosting**: [Vercel](https://vercel.com)
- **Database**: [Neon](https://neon.tech) (PostgreSQL)
- **CMS**: [MicroCMS](https://microcms.io)
- **Email**: [Resend](https://resend.com)
