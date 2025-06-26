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

- **Helpers**: In-source testing（同一ファイル内）
- **Components**: Storybookストーリーでテスト
- **Hooks・React関連**: `.test.ts`ファイルでVitest
- **Utils/services**: Node.js環境でVitest
- **Stories**: Storybookインテグレーションテスト
- MSWでAPIモック

**テスト記述ガイドライン（必須）**:

各テスト対象に応じて以下のガイドラインに従う：

### Helpers（`src/helpers/`）

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
4. **テスト命名**:
   - 「〜の場合」「〜すべき」形式で日本語記述
   - 何をテストしているかが明確に分かる名前
5. **包括的カバレッジ**:
   - 関数のすべての分岐をカバー
   - 想定される入力パターンをすべてテスト
   - 複数の条件の組み合わせもテスト

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

    describe('エッジケース', () => {
      it('空文字列の場合は適切に処理すべき', () => {
        // テストコード
      });
    });
  });
}
```

### Components（`src/components/`）

Storybookストーリーでテストを記述：

1. **ストーリー作成**: `.stories.tsx`ファイルでコンポーネントの様々な状態を定義
2. **Play関数**: インタラクションテストに`play`関数を使用
3. **A11y**: アクセシビリティテストを含める
4. **視覚的テスト**: 異なるpropsでの表示状態をテスト

### Hooks・React関連（`src/hooks/`、`src/libs/react`）

`.test.ts`ファイルでVitestを使用：

1. **ファイル配置**: 対象ファイルと同じディレクトリに`.test.ts`ファイルを作成
2. **React Testing Library**: コンポーネントやhooksのテストに使用
3. **カスタムフック**: `@testing-library/react-hooks`でテスト
4. **非同期処理**: `waitFor`や`act`を適切に使用

例：

```typescript
// useCustomHook.test.ts
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useCustomHook } from './useCustomHook';

describe('useCustomHook', () => {
  it('初期値が正しく設定されるべき', () => {
    const { result } = renderHook(() => useCustomHook());
    expect(result.current.value).toBe(null);
  });
});
```

### 開発メモ

**環境セットアップ**: `.env.example`を`.env.local`にコピーし、ローカルデータベース用Dockerを開始。本番環境ではNeon PostgreSQL、Upstash KV、MicroCMS、Resendを使用。

**MDX処理**: ブログ記事はfrontmatter、数式レンダリング（KaTeX）、シンタックスハイライト（Shiki）を使用。`src/app/blog/(articles)/`に配置。

**モック戦略**: import mapsを使用して条件分岐なしで実装を交換する包括的なStorybookモックシステム。

**コードスタイル**:

- 日本語コメント推奨
- **テスト必須**:
  - Helpers → in-source testing
  - Components → Storybookストーリー
  - Hooks・React関連 → `.test.ts`ファイル
- ESLint zero warnings policy
- Prettier自動フォーマット

**新機能開発**:

- UIコンポーネントは`src/components/`にStorybookストーリー付きで作成
- Hooksは`src/hooks/`に`.test.ts`ファイル付きで作成
- ブログ記事は`src/app/blog/(articles)/[slug]/`に配置
- **重要**: 新しい関数・コンポーネント作成時は適切なテスト方法でテストを追加

**テスト実行の確認**:

- **Helpers**: `pnpm run test [ファイルパス]`でin-source testingが通ることを確認
- **Components**: `pnpm run storybook`でストーリーが正常に表示されることを確認
- **Hooks・React関連**: `pnpm run test [ファイルパス]`で`.test.ts`が通ることを確認
- テストカバレッジは包括的であることを重視
- テストが失敗する場合は実装とテストの両方を見直す
