# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリで作業する際のガイダンスを提供します。

## 必須コマンド

### 開発

- `pnpm run dev` - 開発サーバーを開始
- `pnpm run -F main storybook` - Storybookデザインシステムを起動（ポート6006、main app）
- `pnpm run -F main email` - React Emailテンプレート開発サーバー（ポート3333、main app）

### データベース

- `pnpm run -F main generate` - Drizzle ORMスキーマファイルからマイグレーションを生成
- `pnpm run -F main generate:custom` - カスタムマイグレーションファイルを生成
- `pnpm run -F main migrate` - データベースマイグレーションを実行
- `pnpm run -F main export:schema` - スキーマをSQLファイル（schema.sql）にエクスポート
- `pnpm run -F main build:erd` - ERD（Entity Relationship Diagram）を構築
- `docker compose up -d` - ローカルPostgreSQL、Redis、プロキシサービスを開始
- `docker compose exec postgres psql -U postgres -d main` - ローカルデータベースに接続

### テスト

- `pnpm run test` - すべてのテストを実行（Vitest、UTC timezone）
- `pnpm run test:ui` - Vitest UIとカバレッジを起動
- `pnpm run coverage` - テストカバレッジレポートを生成
- `pnpm run install-playwright` - Playwright依存関係をインストール

### コード品質

- `pnpm run check` - Biome（警告のみ）
- `pnpm run check:write` - Biome（修正も込み）
- `pnpm run ls-lint` - ファイル名/ディレクトリ名の検証
- `pnpm run type-check` - TypeScript型チェック

### ビルド

- `pnpm run build` - プロダクション用ビルド（Turbo）
- `ANALYZE=true pnpm run build` - バンドル分析付きビルド

## アーキテクチャ概要

### プロジェクト構造

**Turborepo Monorepo**: 2つのワークスペースで構成

- **apps/main** - メインのNext.jsアプリケーション
- **packages/helpers** - ユーティリティ関数ライブラリ

外部パッケージ:

- **@k8o/arte-odyssey** - 再利用可能UIコンポーネントライブラリ(npm公開、外部リポジトリ: [ArteOdyssey](https://github.com/k35o/ArteOdyssey))

### 技術スタック

**フロントエンド**:

- **Next.js 15.5** - App Router、React 19、TypeScript
- **TailwindCSS 4.1** - カスタムデザイントークンベース
- **Motion** - アニメーション
- **MDX** - 数式（KaTeX）・シンタックスハイライト（Shiki）付きブログコンテンツ
- **ArteOdyssey** - UIコンポーネントライブラリ(npm: @k8o/arte-odyssey)

**バックエンド・データベース**:

- **Drizzle ORM 0.44** - TypeScriptファーストORM
- **PostgreSQL 18** - 本番環境はNeon、ローカルはDocker
- **Redis** - KV ストレージ（本番環境はUpstash、ローカルはDocker）
- **Zod 4.1** - スキーマバリデーション

**開発ツール**:

- **Turbo 2.5** - モノレポビルドシステム
- **Vitest 3.2** - テストランナー（ブラウザモード対応）
- **Storybook 9.1** - コンポーネント開発環境
- **React Email 4.3** - メールテンプレート
- **MSW 2.11** - APIモック
- **Lefthook 1.13** - Git フック
- **Playwright 1.56** - E2Eテスト

### 重要なパターン

**Conditional Import Maps**: 環境に応じたモック切り替え

```typescript
// package.json imports
"#database/db": {
  "storybook": "./src/mocks/db.mock.ts",
  "default": "./src/database/db.ts"
},
"@/app/blog/_api": {
  "storybook": "./src/mocks/api/blog.mock.ts",
  "default": "./src/app/blog/_api/index.ts"
}
```

**データベーススキーマ**: `apps/main/src/database/schema/`に関係別整理

- コンテンツ: blogs, talks, quizzes, services
- ユーザーデータ: comments, feedbacks, subscribers
- ビュー・回答: blog-views, quiz-answers
- タグシステム: blog-tag, talk-tag, service-tag
- タイプ: quiz-type, service-type

**コンポーネント構成**:

- 再利用可能UIコンポーネント: npmパッケージ `@k8o/arte-odyssey`(外部リポジトリ)
- ページ固有コンポーネント: `apps/main/src/app/[page]/_components/`
- アプリ共通コンポーネント: `apps/main/src/app/_components/`
- 各コンポーネントには`.stories.tsx`が必須

**ヘルパー関数**: `packages/helpers/src/`に分類別整理

- `color/` - 色関連（calc-contrast, extract-color, find-all-colors）
- `date/` - 日付関連（compare, format）
- `number/` - 数値関連（between, cast, commalize, to-precision）
- `array/`, `mdx/`, `ipaddress/`, `ratelimit/` など

### テスト戦略

**Helpers** (`packages/helpers/`):

- In-source testing（`if (import.meta.vitest)`ブロック）
- 同一ファイル内にテストを記述

**Components** (`apps/main/src/app/_components/`):

- Storybookストーリーでテスト
- `@storybook/addon-vitest`でインテグレーション

**Main Application** (`apps/main/src/`):

- Services/Utils: Node.js環境でVitest
- React Components: ブラウザモードでVitest

**テスト記述ガイドライン（必須）**:

### Helpers（`packages/helpers/src/`）

すべてのヘルパー関数にはin-source testingを適用：

1. **テスト配置**: 同一ファイル内に`if (import.meta.vitest)`ブロックでテストを記述
2. **テスト構造**:
   - `describe`でグループ化し、日本語で記述
   - `it`で個別テストケースを記述、日本語で分かりやすく命名
   - BDD（Behavior-Driven Development）スタイルで構成
3. **テスト範囲**:
   - 正常系（Happy Path）
   - 異常系（Error Cases）
   - エッジケース（Edge Cases）
   - 境界値テスト（Boundary Value Testing）

例：

```typescript
if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  describe('functionName', () => {
    describe('正常な入力の場合', () => {
      it('基本的なケースで正しい結果を返すべき', () => {
        // テストコード
      });
    });

    describe('異常な入力の場合', () => {
      it('nullの場合はnullを返すべき', () => {
        // テストコード
      });
    });
  });
}
```

### Components（`apps/main/src/app/_components/`）

Storybookストーリーでテストを記述：

1. **ストーリー作成**: `.stories.tsx`ファイルでコンポーネントの様々な状態を定義
2. **Play関数**: インタラクションテストに`play`関数を使用
3. **A11y**: アクセシビリティテストを含める

### TailwindCSS設計システム

**重要**: ArteOdyssey（`@k8o/arte-odyssey/styles.css`）で定義されたカスタムデザイントークンのみ使用。標準のTailwindクラス（`text-gray-600`など）は使用禁止。

利用可能なカスタムクラス例：

- **テキスト色**: `text-fg-base`, `text-fg-subtle`, `text-fg-mute`, `text-fg-info`
- **背景色**: `bg-bg-base`, `bg-bg-subtle`, `bg-bg-mute`, `bg-primary-bg`
- **ボーダー色**: `border-border-base`, `border-border-subtle`, `border-primary-border`
- **フォントサイズ**: `text-xs`, `text-sm`, `text-md`（カスタム定義）
- **Font Weight**: `font-medium`, `font-bold`（カスタム定義）
- **Radius**: `rounded-sm`, `rounded-md`, `rounded-lg`（カスタム定義）

デザイントークンは `@k8o/arte-odyssey` パッケージで一元管理されています。

### 開発ガイドライン

**環境セットアップ**:

1. `.env.example`を`.env.local`にコピー
2. `docker compose up -d`でローカルサービス開始
3. `pnpm run -F main migrate`でデータベースセットアップ

**新機能開発フロー**:

1. **汎用UIコンポーネント**: 別リポジトリ [ArteOdyssey](https://github.com/k35o/ArteOdyssey) で開発しnpm公開
2. **ページ固有コンポーネント**: `apps/main/src/app/_components/`にStorybookストーリー付きで作成
3. **Helpers**: `packages/helpers/src/`にin-source testing付きで作成
4. **ページ/機能**: `apps/main/src/app/`に配置、適切なテスト方法でテスト追加

**コードスタイル**:

- 日本語コメント推奨
- **テスト必須**: 機能に応じた適切なテスト方法を選択
- **TailwindCSS**: カスタムトークンのみ使用（ArteOdyssey定義）
- **Biome**: リンター・フォーマッター（ESLint/Prettierの代替）
- **ls-lint**: ファイル名/ディレクトリ名の検証

**本番環境**:

- **Database**: Neon PostgreSQL
- **KV**: Upstash Redis
- **CMS**: MicroCMS
- **Email**: Resend
- **Hosting**: Vercel

### Docker サービス

ローカル開発用のDockerサービス：

- **postgres**: PostgreSQL 18（ポート5432）
- **neon-proxy**: Neon WebSocket プロキシ（ポート5433）
- **redis**: Redis（ポート6379）
- **serverless-redis-http**: Upstash互換HTTPプロキシ（ポート8079）
