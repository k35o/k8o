# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリで作業する際のガイダンスを提供します。

## クイックリファレンス

### 必須コマンド

```bash
# 開発
pnpm run dev                          # 開発サーバー起動
pnpm run -F main storybook            # Storybook起動（ポート6006）
pnpm run -F main email                # React Email開発サーバー（ポート3333）

# データベース
pnpm run -F @repo/database dev        # ローカルTursoサーバー起動
pnpm run -F @repo/database generate   # マイグレーション生成
pnpm run -F @repo/database migrate    # マイグレーション実行

# テスト・品質
pnpm run test                         # 全テスト実行
pnpm run check:write                  # Biome（リント+フォーマット）
pnpm run type-check                   # TypeScript型チェック
pnpm run ls-lint                      # ファイル名検証

# ビルド
pnpm run build                        # プロダクションビルド
ANALYZE=true pnpm run build           # バンドル分析付きビルド
```

### プロジェクト構造

```
k8o/
├── apps/main/                    # Next.js App Router
│   └── src/app/
│       ├── _components/          # アプリ共通コンポーネント
│       ├── [page]/_components/   # ページ固有コンポーネント
│       └── api/                  # APIルート
├── packages/
│   ├── database/src/schema/      # Drizzleスキーマ
│   └── helpers/src/              # ユーティリティ関数
└── @k8o/arte-odyssey             # UIライブラリ（npm外部）
```

### 重要ルール

1. **TailwindCSS**: ArteOdysseyのカスタムトークンのみ使用
   - `text-fg-base`, `bg-bg-base`, `border-border-base` など
   - 標準クラス（`text-gray-600`等）は**禁止**

2. **テスト方式**:
   - Helpers → In-source testing（`if (import.meta.vitest)`）
   - Components → Storybook stories（`.stories.tsx`必須）
   - Services → Vitest unit tests

3. **コンポーネント**: 各コンポーネントに`.stories.tsx`が必須

4. **コメント**: 日本語推奨

5. **画像**: `img`タグ禁止、`next/image`を使用

## 詳細ドキュメント

| ドキュメント | 内容 |
|-------------|------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | システム構成、技術スタック、設計思想 |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | 開発フロー、コード規約、PR手順 |
| [docs/API.md](./docs/API.md) | APIエンドポイント仕様 |
| [docs/TESTING.md](./docs/TESTING.md) | テスト戦略、作成ガイドライン |
| [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) | デプロイ手順、環境設定 |
| [docs/SECURITY.md](./docs/SECURITY.md) | セキュリティポリシー |
| [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) | よくある問題と解決策 |

## データベーススキーマ

`packages/database/src/schema/`に関係別整理:
- コンテンツ: blogs, talks, quizzes, services
- ユーザーデータ: comments, feedback, subscribers
- ビュー・回答: blog-views, quiz-answers, quiz-questions
- タグ: blog-tag, talk-tag, service-tag, tags
- タイプ: quiz-type, service-type
- コメント関連: blog-comment

## ヘルパー関数

`packages/helpers/src/`に分類別整理:
- `array/` - 配列操作
- `color/` - 色関連（calc-contrast, extract-color等）
- `date/` - 日付関連（compare, format等）
- `number/` - 数値関連（between, commalize等）
- `mdx/` - MDX処理
- `cn.ts` - クラス名結合
- `ipaddress.ts` - IPアドレス処理
- `sleep.ts` - 遅延処理
- `uuid-v4.ts` - UUID生成
- `is-internal-route.ts` - 内部ルート判定

## Conditional Export Maps

環境に応じたモック切り替え:
```json
{
  "storybook": "./src/__mocks__/db.ts",
  "node": "./src/index.ts"
}
```

## 本番環境

- **Hosting**: Vercel
- **Database**: Turso (libSQL/SQLite)
- **CMS**: MicroCMS
- **Email**: Resend
