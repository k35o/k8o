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

- Node.js: 24.12.0
- pnpm: 10.25.0
- Docker（ローカルデータベース用）

### セットアップ手順

```bash
# 1. リポジトリをクローン
git clone https://github.com/k35o/k8o.git
cd k8o

# 2. 依存関係をインストール
pnpm i --frozen-lockfile

# 3. 環境変数を設定
cp apps/main/.env.example apps/main/.env.local

# 4. Dockerサービスを起動
docker compose up -d

# 5. データベースマイグレーションを実行
pnpm run -F @repo/database migrate

# 6. 開発サーバーを起動
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
2. **ブランチの作成**: `git checkout -b feature/your-feature-name`
3. **開発**: テストを書きながら開発（TDD推奨）
4. **コード品質チェック**:
   ```bash
   pnpm run check:write  # リンター・フォーマッター
   pnpm run ls-lint      # ファイル名検証
   pnpm run type-check   # 型チェック
   pnpm run test         # テスト
   ```
5. **コミット**: Lefthookが自動的にpre-commitフックを実行
6. **プッシュ**: `git push origin feature/your-feature-name`
7. **プルリクエスト作成**

## コーディング規約

### TypeScript

- **strict mode**を使用
- 型は明示的に定義（`any`の使用は避ける）
- 関数の戻り値の型を明示

### React/Next.js

- **Server Componentsをデフォルト**とし、必要な場合のみClient Componentsを使用
- コンポーネントは小さく、単一責任の原則に従う
- Props型は`type`で定義

### TailwindCSS

**ArteOdysseyのカスタムトークンのみ使用**。標準のTailwindクラス（`text-gray-600`など）は**使用禁止**。

```tsx
// Good
<div className="text-fg-base bg-bg-base">

// Bad
<div className="text-gray-900 bg-white">
```

詳細は[CLAUDE.md](./CLAUDE.md)を参照。

### ファイル命名規則

- コンポーネント: `kebab-case` (例: `blog-card.tsx`)
- ユーティリティ: `kebab-case` (例: `format-date.ts`)
- テストファイル: `*.test.ts` または `*.test.tsx`
- Storybookストーリー: `*.stories.tsx`

ls-lintが自動的に検証します。

### コメント

- 日本語コメントを推奨
- 複雑なロジックには必ずコメントを追加
- TODOコメントにはIssue番号を含める: `// TODO(#123): 説明`

## コミットメッセージ

### フォーマット

```
<type>: <subject>

<body>

<footer>
```

### Type

| Type | 用途 |
|------|------|
| `feat` | 新機能 |
| `fix` | バグ修正 |
| `docs` | ドキュメントのみの変更 |
| `style` | コードの動作に影響しない変更 |
| `refactor` | リファクタリング |
| `test` | テストの追加・修正 |
| `chore` | ビルドプロセスやツールの変更 |

### 例

```
feat: ブログ記事のタグフィルター機能を追加

ユーザーがタグでブログ記事をフィルタリングできるように
タグ選択UIとフィルタリングロジックを実装

Closes #123
```

## プルリクエスト

### 条件

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

プロジェクトでは3つのテスト方法を使い分けます：

| テスト対象 | テスト手法 | 場所 |
|-----------|----------|------|
| Helpers | In-source testing | `packages/helpers/src/**/*.ts` |
| Components | Storybook stories | `apps/main/src/app/**/*.stories.tsx` |
| Services | Vitest unit tests | `apps/main/src/services/**/*.test.ts` |

### テスト実行

```bash
pnpm run test        # すべてのテスト
pnpm run test:ui     # Vitest UI
pnpm run coverage    # カバレッジ
```

詳細なテスト作成ガイドラインは[docs/TESTING.md](./docs/TESTING.md)を参照。

## Storybook開発

```bash
pnpm run -F main storybook
```

- すべてのコンポーネントにストーリーを作成
- アクセシビリティチェック（a11y addon）を活用
- 様々な状態をストーリーで表現

## 質問・相談

- GitHubのIssueで質問
- Discussionsで設計相談

コントリビューションをお待ちしています！
