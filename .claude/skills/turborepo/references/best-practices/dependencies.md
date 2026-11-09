# 依存関係の管理

Turborepoモノレポにおける依存関係管理のベストプラクティス。

## 基本原則: 使用する場所にインストール

依存関係はルートではなく、使用するパッケージに配置する。

```bash
# 良い例: 特定のパッケージにインストール
pnpm add react --filter=@repo/ui
pnpm add next --filter=web

# 避けるべき: ルートにインストール
pnpm add react -w  # リポジトリレベルのツールのみ！
```

## ローカルインストールのメリット

### 1. 明確さ

各パッケージの `package.json` に必要なものが正確にリストされる:

```json
// packages/ui/package.json
{
  "dependencies": {
    "react": "^18.0.0",
    "class-variance-authority": "^0.7.0"
  }
}
```

### 2. 柔軟性

必要に応じて異なるパッケージで異なるバージョンを使用できる:

```json
// packages/legacy-ui/package.json
{ "dependencies": { "react": "^17.0.0" } }

// packages/ui/package.json
{ "dependencies": { "react": "^18.0.0" } }
```

### 3. キャッシュの効率化

ルートにインストールするとワークスペースのロックファイルが変更され、すべてのキャッシュが無効化される。

### 4. プルーニングのサポート

`turbo prune` でDockerイメージ向けに未使用の依存関係を除去できる。

## ルートに配置すべきもの

リポジトリレベルのツールのみ:

```json
// ルートのpackage.json
{
  "devDependencies": {
    "turbo": "latest",
    "husky": "^8.0.0",
    "lint-staged": "^15.0.0"
  }
}
```

アプリケーションの依存関係は**含めない**:

- react, next, express
- lodash, axios, zod
- テストライブラリ（本当にリポジトリ全体で共通でない限り）

## 依存関係のインストール

### 単一パッケージ

```bash
# pnpm
pnpm add lodash --filter=@repo/utils

# npm
npm install lodash --workspace=@repo/utils

# yarn
yarn workspace @repo/utils add lodash

# bun
cd packages/utils && bun add lodash
```

### 複数パッケージ

```bash
# pnpm
pnpm add jest --save-dev --filter=web --filter=@repo/ui

# npm
npm install jest --save-dev --workspace=web --workspace=@repo/ui

# yarn (v2+)
yarn workspaces foreach -R --from '{web,@repo/ui}' add jest --dev
```

### 内部パッケージ

```bash
# pnpm
pnpm add @repo/ui --filter=web

# package.jsonが更新される:
{
  "dependencies": {
    "@repo/ui": "workspace:*"
  }
}
```

## バージョンの同期

### 方法1: ツールの活用

```bash
# syncpack - バージョンの不一致を検出・修正
npx syncpack list-mismatches
npx syncpack fix-mismatches

# manypkg - 同様の機能
npx @manypkg/cli check
npx @manypkg/cli fix

# sherif - Rustベース、非常に高速
npx sherif
```

### 方法2: パッケージマネージャーのコマンド

```bash
# pnpm - すべてのパッケージで更新
pnpm up --recursive typescript@latest

# npm - 全ワークスペースで更新
npm install typescript@latest --workspaces
```

### 方法3: pnpm Catalogs（pnpm 9.5以降）

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"

catalog:
  react: ^18.2.0
  typescript: ^5.3.0
```

```json
// 任意のpackage.json
{
  "dependencies": {
    "react": "catalog:"  // カタログのバージョンを使用
  }
}
```

## 内部依存関係と外部依存関係

### 内部（ワークスペース）

```json
// pnpm/bun
{ "@repo/ui": "workspace:*" }

// npm/yarn
{ "@repo/ui": "*" }
```

Turborepoはこれらの関係性を理解し、適切なビルド順序を決定する。

### 外部（npmレジストリ）

```json
{ "lodash": "^4.17.21" }
```

npmの標準的なセマンティックバージョニング。

## ピア依存関係

コンシューマーに依存関係の提供を期待するライブラリパッケージの場合:

```json
// packages/ui/package.json
{
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "react": "^18.0.0",      // 開発・テスト用
    "react-dom": "^18.0.0"
  }
}
```

## よくある問題

### "Module not found"

1. 正しいパッケージに依存関係がインストールされているか確認する
2. `pnpm install` / `npm install` を実行してロックファイルを更新する
3. パッケージのexportsが定義されているか確認する

### バージョンの競合

パッケージごとに異なるバージョンを使用できる。これはバグではなく機能である。ただし、一貫性が必要な場合は:

1. ツールの活用（syncpack, manypkg）
2. pnpm catalogsの使用
3. lintルールの作成

### ホイスティングの問題

一部のツールは特定の場所に依存関係があることを期待する。パッケージマネージャーの設定で対応:

```yaml
# .npmrc (pnpm)
public-hoist-pattern[]=*eslint*
public-hoist-pattern[]=*prettier*
```

## ロックファイル

以下のために**必須**:

- 再現可能なビルド
- Turborepoの依存関係分析
- キャッシュの正確性

```bash
# ロックファイルをコミットすること！
git add pnpm-lock.yaml  # またはpackage-lock.json, yarn.lock
```
