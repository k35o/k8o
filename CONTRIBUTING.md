# Contributing to k8o

このドキュメントは、k8oプロジェクトへの貢献方法を説明します。

## 目次

- [開発環境のセットアップ](#開発環境のセットアップ)
- [開発フロー](#開発フロー)
- [コーディング規約](#コーディング規約)
- [コミットメッセージ](#コミットメッセージ)
- [プルリクエスト](#プルリクエスト)
- [テスト](#テスト)

## 開発環境のセットアップ

### 必要な環境

- Node.js: 22.21.0
- pnpm: 10.20.0
- Docker（ローカルデータベース用）

### セットアップ手順

1. リポジトリをクローン

```bash
git clone https://github.com/k35o/k8o.git
cd k8o
```

2. 依存関係をインストール

```bash
pnpm i --frozen-lockfile
```

3. 環境変数を設定

```bash
cp core/.env.example core/.env.local
```

4. Dockerサービスを起動

```bash
docker compose up -d
```

5. データベースマイグレーションを実行

```bash
pnpm run -F core migrate
```

6. 開発サーバーを起動

```bash
pnpm run dev
```

## 開発フロー

### ブランチ戦略

- `main` - 本番環境にデプロイされる安定版
- `feature/*` - 新機能開発用
- `fix/*` - バグ修正用
- `refactor/*` - リファクタリング用

### 開発ステップ

1. **Issueの作成または確認**
   - 既存のIssueを確認するか、新しいIssueを作成

2. **ブランチの作成**

```bash
git checkout -b feature/your-feature-name
```

3. **開発**
   - コードを書く前に、関連するドキュメントを確認
   - テストを書きながら開発（TDD推奨）

4. **コード品質チェック**

```bash
# リンター・フォーマッター
pnpm run check:write

# ファイル名検証
pnpm run ls-lint

# 型チェック
pnpm run type-check

# テスト
pnpm run test
```

5. **コミット**
   - Lefthookが自動的にpre-commitフックを実行
   - コミットメッセージ規約に従う

6. **プッシュ**

```bash
git push origin feature/your-feature-name
```

7. **プルリクエスト作成**
   - GitHub上でプルリクエストを作成
   - テンプレートに従って記述

## コーディング規約

### TypeScript

- **strict mode**を使用
- 型は明示的に定義（`any`の使用は避ける）
- 関数の戻り値の型を明示

```typescript
// Good
function getUserName(id: string): string {
  return `user-${id}`;
}

// Bad
function getUserName(id) {
  return `user-${id}`;
}
```

### React/Next.js

- **Server Componentsをデフォルト**とし、必要な場合のみClient Componentsを使用
- コンポーネントは小さく、単一責任の原則に従う
- Props型は`type`で定義

```typescript
// Good
type ButtonProps = {
  label: string;
  onClick: () => void;
};

export const Button: FC<ButtonProps> = ({ label, onClick }) => {
  return <button onClick={onClick}>{label}</button>;
};
```

### TailwindCSS

- **ArteOdysseyのカスタムトークンのみ使用**
- 標準のTailwindクラス（`text-gray-600`など）は**使用禁止**

```tsx
// Good
<div className="text-fg-base bg-bg-base">

// Bad
<div className="text-gray-900 bg-white">
```

利用可能なクラス：
- テキスト色: `text-fg-base`, `text-fg-subtle`, `text-fg-mute`
- 背景色: `bg-bg-base`, `bg-bg-subtle`, `bg-bg-mute`
- ボーダー色: `border-border-base`, `border-border-subtle`

### ファイル命名規則

- コンポーネント: `kebab-case` (例: `blog-card.tsx`)
- ユーティリティ: `kebab-case` (例: `format-date.ts`)
- テストファイル: `*.test.ts` または `*.test.tsx`
- Storybookストーリー: `*.stories.tsx`

ls-lintが自動的に検証します。

### コメント

- 日本語コメントを推奨
- 複雑なロジックには必ずコメントを追加
- TODOコメントにはIssue番号を含める

```typescript
// Good
// TODO(#123): async/awaitコンポーネントのテスト対応

// Bad
// TODO: fix this later
```

## コミットメッセージ

### フォーマット

```
<type>: <subject>

<body>

<footer>
```

### Type

- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメントのみの変更
- `style`: コードの動作に影響しない変更（空白、フォーマット等）
- `refactor`: リファクタリング
- `test`: テストの追加・修正
- `chore`: ビルドプロセスやツールの変更

### 例

```
feat: ブログ記事のタグフィルター機能を追加

ユーザーがタグでブログ記事をフィルタリングできるように
タグ選択UIとフィルタリングロジックを実装

Closes #123
```

## プルリクエスト

### プルリクエストの条件

- [ ] すべてのテストが通る
- [ ] コード品質チェックが通る（Biome、ls-lint、type-check）
- [ ] 新機能には適切なテストが含まれる
- [ ] 必要に応じてドキュメントが更新されている
- [ ] コンフリクトが解消されている

### レビュープロセス

1. 自動CI/CDチェックの完了を待つ
2. レビュワーからのフィードバックに対応
3. 承認後、mainブランチにマージ

## テスト

### テスト戦略

プロジェクトでは3つのテスト方法を使い分けます：

#### 1. Helpers（`packages/helpers/`）

**In-source testing**を使用：

```typescript
export function add(a: number, b: number): number {
  return a + b;
}

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;

  describe('add', () => {
    it('2つの数値を正しく加算する', () => {
      expect(add(1, 2)).toBe(3);
    });
  });
}
```

#### 2. コンポーネント（`core/src/app/_components/`）

**Storybookストーリー**でテスト：

```tsx
// button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta = {
  component: Button,
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    label: 'Click me',
  },
};
```

#### 3. サービス層（`core/src/services/`）

**Vitest**でユニットテスト：

```typescript
// blog.test.ts
import { describe, expect, it } from 'vitest';
import { getBlog } from './blog';

describe('getBlog', () => {
  it('ブログ記事を取得できる', async () => {
    const blog = await getBlog('test-slug');
    expect(blog).toBeDefined();
  });
});
```

### テスト実行

```bash
# すべてのテスト
pnpm run test

# Vitest UI
pnpm run test:ui

# カバレッジ
pnpm run coverage

# E2Eテスト
pnpm run -F core test:e2e
```

### テスト作成のガイドライン

1. **テストは必須** - すべての新機能にテストを追加
2. **日本語で記述** - describeとitは日本語で分かりやすく
3. **BDDスタイル** - Given-When-Thenパターンを推奨
4. **モックの使用** - 外部APIはMSWでモック

```typescript
describe('ブログ記事取得', () => {
  describe('正常系', () => {
    it('公開済み記事を取得できる', async () => {
      // Given: 公開済み記事が存在する
      // When: 記事を取得
      // Then: 記事データが返される
    });
  });

  describe('異常系', () => {
    it('存在しない記事の場合はnullを返す', async () => {
      // ...
    });
  });
});
```

## Storybook開発

コンポーネント開発にはStorybookを使用：

```bash
pnpm run -F core storybook
```

- すべてのコンポーネントにストーリーを作成
- アクセシビリティチェック（a11y addon）を活用
- 様々な状態（バリエーション）をストーリーで表現

## 質問・相談

- GitHubのIssueで質問
- Discussionsで設計相談

コントリビューションをお待ちしています！
