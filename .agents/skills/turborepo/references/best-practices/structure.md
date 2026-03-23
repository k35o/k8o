# リポジトリ構成

Turborepoモノレポの構成に関する詳細なガイダンス。

## ワークスペース設定

### pnpm（推奨）

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
```

### npm/yarn/bun

```json
// package.json
{
  "workspaces": ["apps/*", "packages/*"]
}
```

## ルートのpackage.json

```json
{
  "name": "my-monorepo",
  "private": true,
  "packageManager": "pnpm@9.0.0",
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "test": "turbo run test"
  },
  "devDependencies": {
    "turbo": "latest"
  }
}
```

重要なポイント:

- `private: true` - 誤った公開を防止
- `packageManager` - パッケージマネージャーのバージョンを統一
- **スクリプトは `turbo run` に委譲するだけ** - ここに実際のビルドロジックは書かない！
- 最小限のdevDependencies（turboとリポジトリツールのみ）

## パッケージタスクを常に優先

**常にパッケージタスクを使用する。ルートタスクは、パッケージタスクでは実現できない場合のみ使用する。**

```json
// packages/web/package.json
{
  "scripts": {
    "build": "next build",
    "lint": "eslint .",
    "test": "vitest",
    "typecheck": "tsc --noEmit"
  }
}

// packages/api/package.json
{
  "scripts": {
    "build": "tsc",
    "lint": "eslint .",
    "test": "vitest",
    "typecheck": "tsc --noEmit"
  }
}
```

パッケージタスクにより、Turborepoは以下が可能になる:

1. **並列実行** - `web#lint` と `api#lint` を同時に実行
2. **個別キャッシュ** - 各パッケージのタスク出力が個別にキャッシュされる
3. **正確なフィルタリング** - `turbo run test --filter=web` で1つのパッケージのみ実行

**ルートタスクはフォールバック**として、パッケージ単位では本当に実行できないタスクに使用する:

```json
// 必要でなければ避ける - 逐次実行、並列化不可、フィルタリング不可
{
  "scripts": {
    "lint": "eslint apps/web && eslint apps/api && eslint packages/ui"
  }
}
```

## ルートのturbo.json

```json
{
  "$schema": "https://turborepo.dev/schema.v2.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "lint": {},
    "test": {
      "dependsOn": ["build"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

## ディレクトリの整理

### パッケージのグループ化

ワークスペースパスを追加してパッケージをグループ化できる:

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
  - "packages/config/*"    # 設定をグループ化
  - "packages/features/*"  # 機能パッケージ
```

これにより以下の構成が可能:

```
packages/
├── ui/
├── utils/
├── config/
│   ├── eslint/
│   ├── typescript/
│   └── tailwind/
└── features/
    ├── auth/
    └── payments/
```

### やってはいけないこと

```yaml
# 悪い例: ネストしたワイルドカードは曖昧な動作を引き起こす
packages:
  - "packages/**"  # これはやめること！
```

## パッケージの構造

### 最低限必要なファイル

```
packages/ui/
├── package.json    # 必須: パッケージとして認識される
├── src/            # ソースコード
│   └── button.tsx
└── tsconfig.json   # TypeScript設定（TSを使用する場合）
```

### package.jsonの要件

```json
{
  "name": "@repo/ui",           // 一意で名前空間付きの名前
  "version": "0.0.0",           // バージョン（内部パッケージは0.0.0で可）
  "private": true,              // 誤った公開を防止
  "exports": {                  // エントリーポイント
    "./button": "./src/button.tsx"
  }
}
```

## TypeScript設定

### 共有ベース設定

共有TypeScript設定パッケージを作成する:

```
packages/
└── typescript-config/
    ├── package.json
    ├── base.json
    ├── nextjs.json
    └── library.json
```

```json
// packages/typescript-config/base.json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "module": "ESNext",
    "target": "ES2022"
  }
}
```

### パッケージでの継承

```json
// packages/ui/tsconfig.json
{
  "extends": "@repo/typescript-config/library.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### ルートのtsconfig.jsonは不要

ワークスペースのルートに `tsconfig.json` は通常不要である。各パッケージが共有設定パッケージを継承する独自の設定を持つべきである。

## ESLint設定

### 共有設定パッケージ

```
packages/
└── eslint-config/
    ├── package.json
    ├── base.js
    ├── next.js
    └── library.js
```

```json
// packages/eslint-config/package.json
{
  "name": "@repo/eslint-config",
  "exports": {
    "./base": "./base.js",
    "./next": "./next.js",
    "./library": "./library.js"
  }
}
```

### パッケージでの使用

```js
// apps/web/.eslintrc.js
module.exports = {
  extends: ["@repo/eslint-config/next"],
};
```

## ロックファイル

ロックファイルは以下のために**必須**:

- 再現可能なビルド
- Turborepoによるパッケージ依存関係の把握
- キャッシュの正確性

ロックファイルがないと、予期しない動作が発生する。
