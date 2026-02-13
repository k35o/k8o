# モノレポのベストプラクティス

健全なTurborepoモノレポを構築・維持するための重要なパターン。

## リポジトリ構成

### 標準レイアウト

```
my-monorepo/
├── apps/                    # アプリケーションパッケージ（デプロイ対象）
│   ├── web/
│   ├── docs/
│   └── api/
├── packages/                # ライブラリパッケージ（共有コード）
│   ├── ui/
│   ├── utils/
│   └── config-*/           # 共有設定（eslint, typescript など）
├── package.json            # ルートpackage.json（最小限の依存関係）
├── turbo.json              # Turborepo設定
├── pnpm-workspace.yaml     # （pnpm）またはpackage.json内のworkspaces
└── pnpm-lock.yaml          # ロックファイル（必須）
```

### 基本原則

1. **`apps/` はデプロイ対象**: Next.jsサイト、API、CLI など、デプロイされるもの
2. **`packages/` はライブラリ**: アプリや他のパッケージから利用される共有コード
3. **1パッケージ1目的**: 各パッケージは1つのことをうまくやるべき
4. **パッケージのネストは禁止**: パッケージの中にパッケージを入れない

## パッケージの種類

### アプリケーションパッケージ（`apps/`）

- **デプロイ対象**: パッケージグラフの「エンドポイント」
- **他のパッケージからインストールされない**: アプリは他のパッケージの依存関係にすべきではない
- **共有コードは含めない**: コードの共有が必要な場合は `packages/` に抽出する

```json
// apps/web/package.json
{
  "name": "web",
  "private": true,
  "dependencies": {
    "@repo/ui": "workspace:*",
    "next": "latest"
  }
}
```

### ライブラリパッケージ（`packages/`）

- **共有コード**: ユーティリティ、コンポーネント、設定
- **名前空間付きの名前**: `@repo/` や `@yourorg/` プレフィックスを使用
- **明確なエクスポート**: パッケージが公開するものを定義する

```json
// packages/ui/package.json
{
  "name": "@repo/ui",
  "exports": {
    "./button": "./src/button.tsx",
    "./card": "./src/card.tsx"
  }
}
```

## パッケージのコンパイル戦略

### ジャストインタイム（最もシンプル）

TypeScriptを直接エクスポートし、アプリのバンドラーにコンパイルさせる。

```json
{
  "name": "@repo/ui",
  "exports": {
    "./button": "./src/button.tsx"
  }
}
```

**メリット**: ビルド設定不要、変更が即座に反映
**デメリット**: ビルドキャッシュ不可、アプリのバンドラーサポートが必要

### コンパイル済み（ライブラリ推奨）

パッケージ自身が `tsc` やバンドラーでコンパイルする。

```json
{
  "name": "@repo/ui",
  "exports": {
    "./button": {
      "types": "./src/button.tsx",
      "default": "./dist/button.js"
    }
  },
  "scripts": {
    "build": "tsc"
  }
}
```

**メリット**: Turborepoでキャッシュ可能、どこでも動作
**デメリット**: 設定が増える

## 依存関係の管理

### 使用する場所にインストール

依存関係はルートではなく、使用するパッケージにインストールする。

```bash
# 良い例: 必要なパッケージにインストール
pnpm add lodash --filter=@repo/utils

# 避けるべき: ルートにすべてインストール
pnpm add lodash -w  # リポジトリレベルのツールのみ
```

### ルートの依存関係

ルートの `package.json` に入れるべきもの:

- `turbo` - ビルドシステム
- `husky`, `lint-staged` - Gitフック
- リポジトリレベルのツール

### 内部依存関係

内部パッケージにはworkspaceプロトコルを使用:

```json
// pnpm/bun
{ "@repo/ui": "workspace:*" }

// npm/yarn
{ "@repo/ui": "*" }
```

## エクスポートのベストプラクティス

### `exports` フィールドを使用（`main` ではなく）

```json
{
  "exports": {
    ".": "./src/index.ts",
    "./button": "./src/button.tsx",
    "./utils": "./src/utils.ts"
  }
}
```

### バレルファイルを避ける

すべてを再エクスポートする `index.ts` ファイルを作成しない:

```typescript
// 悪い例: packages/ui/src/index.ts
export * from './button';
export * from './card';
export * from './modal';
// ... 1つだけ必要でもすべてインポートされる

// 良い例: package.jsonで直接エクスポート
{
  "exports": {
    "./button": "./src/button.tsx",
    "./card": "./src/card.tsx"
  }
}
```

### パッケージに名前空間を付ける

```json
// 良い例
{ "name": "@repo/ui" }
{ "name": "@acme/utils" }

// 避けるべき（npmレジストリと競合する）
{ "name": "ui" }
{ "name": "utils" }
```

## よくあるアンチパターン

### パッケージ境界を越えたファイルアクセス

```typescript
// 悪い例: 別のパッケージの内部に直接アクセス
import { Button } from '../../packages/ui/src/button';

// 良い例: 適切にインストールしてインポート
import { Button } from '@repo/ui/button';
```

### アプリ内の共有コード

```
// 悪い例
apps/
  web/
    shared/        # これはパッケージにすべき！
      utils.ts

// 良い例
packages/
  utils/           # 適切な共有パッケージ
    src/utils.ts
```

### ルートの依存関係が多すぎる

```json
// 悪い例: ルートにアプリの依存関係がある
{
  "dependencies": {
    "react": "^18",
    "next": "^14",
    "lodash": "^4"
  }
}

// 良い例: ルートにはリポジトリツールのみ
{
  "devDependencies": {
    "turbo": "latest",
    "husky": "latest"
  }
}
```

## 関連項目

- [structure.md](./structure.md) - リポジトリ構成パターンの詳細
- [packages.md](./packages.md) - 内部パッケージの作成と管理
- [dependencies.md](./dependencies.md) - 依存関係の管理戦略
