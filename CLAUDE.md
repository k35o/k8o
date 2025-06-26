# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリで作業する際のガイダンスを提供します。

## 必須コマンド

### 開発

- `pnpm run dev` - 開発サーバーを開始
- `pnpm run storybook` - Storybookデザインシステムを起動（ポート6006）
- `pnpm run email` - メールテンプレート開発サーバー（ポート3333）

### データベース

- `pnpm run generate` - スキーマファイルからマイグレーションを生成
- `pnpm run migrate` - データベースマイグレーションを実行
- `pnpm run export:schema` - スキーマをSQLファイルにエクスポート
- `pnpm run build:erd` - ERDを構築
- `docker compose up -d` - ローカルPostgreSQLとKVサービスを開始
- `docker compose exec postgres psql -U postgres -d main` - ローカルデータベースに接続

### テスト

- `pnpm run test` - すべてのテストを実行（複数プロジェクトでVitest）
- `pnpm run test:ui` - Vitest UIを起動
- `pnpm run coverage` - テストカバレッジレポートを生成

### コード品質

- `pnpm run lint` - ESLint（警告ゼロポリシー）
- `pnpm run lint:fix` - ESLintで自動修正
- `pnpm run lint:inspect` - ESLint設定インスペクター
- `pnpm run ls-lint` - ファイル名/ディレクトリ名の検証
- `pnpm run type-check` - TypeScript型チェック
- `pnpm run format` - Prettierでコードフォーマット
- `pnpm run format:check` - フォーマットの確認

### ビルド

- `pnpm run build` - プロダクション用ビルド
- `ANALYZE=true pnpm run build` - バンドル分析付きビルド

## アーキテクチャ概要

### アプリケーション構造

- **Next.js 15** App RouterとTypeScript使用
- **MDXインテグレーション** 数式・シンタックスハイライト付きブログコンテンツ
- **データベース**: Drizzle ORMとPostgreSQL（本番環境ではNeon）
- **スタイリング**: TailwindCSS、Storybookのデザインシステム
- **テスト**: コンポーネント用ブラウザモード、utils/services用独立プロジェクトでVitest
- **メール**: React Emailテンプレート

### 重要なパターン

**Import Maps**: package.jsonのカスタムimport mapsと環境固有モック：

- `#database/db` - データベース接続（Storybookではモック）
- `#api/blog` - ブログAPI（Storybookではモック）
- `#libs/react` - Reactユーティリティ（Storybookではモック）
- `#link-card/metadata` - リンクカードメタデータ（Storybookではモック）
- `#next/server` - Next.jsサーバー（Storybookではモック）

**データベーススキーマ**: `src/database/schema/`に整理された関係：

- コンテンツ: blogs, talks, quizzes
- ユーザーデータ: comments, feedbacks, subscribers
- タグシステム: blog-tag, talk-tag, service-tag

**コンポーネント構成**:

- 再利用可能UIコンポーネント: `src/components/`
- ページ固有コンポーネント: `src/app/[page]/_components/`
- 各コンポーネントには`.stories.tsx`がある

**ヘルパー関数**: `src/helpers/`に分類別整理：

- `color/` - 色関連（calc-contrast, extract-color, find-all-colors）
- `date/` - 日付関連（compare, format）
- `number/` - 数値関連（between, cast, commalize, to-precision）
- `array/`, `mdx/`, `ipaddress/`, `ratelimit/` など

**テスト戦略**:

- Utils/services: Node.js環境
- コンポーネント: ブラウザモードでPlaywright
- Stories: Storybookインテグレーションテスト
- **In-source testing**: t_wadaメソッドに従ったヘルパー関数のテスト
- MSWでAPIモック

### 開発メモ

**環境セットアップ**: `.env.example`を`.env.local`にコピーし、ローカルデータベース用Dockerを開始。本番環境ではNeon PostgreSQL、Upstash KV、MicroCMS、Resendを使用。

**MDX処理**: ブログ記事はfrontmatter、数式レンダリング（KaTeX）、シンタックスハイライト（Shiki）を使用。`src/app/blog/(articles)/`に配置。

**モック戦略**: import mapsを使用して条件分岐なしで実装を交換する包括的なStorybookモックシステム。

**コードスタイル**:

- 日本語コメント推奨
- In-source testingでヘルパー関数をテスト
- ESLint zero warnings policy
- Prettier自動フォーマット

**新機能開発**:

- 色関連機能は`src/helpers/color/`に追加
- UIコンポーネントは`src/components/`にStorybookストーリー付きで作成
- ブログ記事は`src/app/blog/(articles)/[slug]/`に配置
