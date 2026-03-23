# GitHub Actions

TurborepoとGitHub Actionsの完全なセットアップガイド。

## 基本的なワークフロー構成

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: 依存関係のインストール
        run: npm ci

      - name: ビルドとテスト
        run: turbo run build test lint
```

## パッケージマネージャーのセットアップ

### pnpm

```yaml
- uses: pnpm/action-setup@v3
  with:
    version: 9

- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: 'pnpm'

- run: pnpm install --frozen-lockfile
```

### Yarn

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: 'yarn'

- run: yarn install --frozen-lockfile
```

### Bun

```yaml
- uses: oven-sh/setup-bun@v1
  with:
    bun-version: latest

- run: bun install --frozen-lockfile
```

## リモートキャッシュのセットアップ

### 1. Vercelアクセストークンの作成

1. [Vercelダッシュボード](https://vercel.com/account/tokens)にアクセス
2. 適切なスコープで新しいトークンを作成
3. トークンの値をコピー

### 2. シークレットと変数の追加

GitHubリポジトリの設定で:

**シークレット** (Settings > Secrets and variables > Actions > Secrets):

- `TURBO_TOKEN`: Vercelアクセストークン

**変数** (Settings > Secrets and variables > Actions > Variables):

- `TURBO_TEAM`: Vercelチームのスラッグ

### 3. ワークフローへの追加

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    env:
      TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
      TURBO_TEAM: ${{ vars.TURBO_TEAM }}
```

## 代替手段: actions/cache

リモートキャッシュが使用できない場合、Turborepoのローカルキャッシュディレクトリをキャッシュする:

```yaml
- uses: actions/cache@v4
  with:
    path: .turbo
    key: turbo-${{ runner.os }}-${{ hashFiles('**/turbo.json', '**/package-lock.json') }}
    restore-keys: |
      turbo-${{ runner.os }}-
```

注意: ブランチごとのキャッシュとなるため、リモートキャッシュほど効果的ではない。

## 完全な例

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    env:
      TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
      TURBO_TEAM: ${{ vars.TURBO_TEAM }}

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2

      - uses: pnpm/action-setup@v3
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: 依存関係のインストール
        run: pnpm install --frozen-lockfile

      - name: ビルド
        run: turbo run build --affected

      - name: テスト
        run: turbo run test --affected

      - name: リント
        run: turbo run lint --affected
```
