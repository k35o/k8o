# 内部パッケージの作成

モノレポにおける内部パッケージの作成と構成方法。

## パッケージ作成チェックリスト

1. `packages/` にディレクトリを作成
2. 名前とexportsを含む `package.json` を追加
3. `src/` にソースコードを配置
4. TypeScriptを使用する場合は `tsconfig.json` を追加
5. 利用するパッケージに依存関係としてインストール
6. パッケージマネージャーのinstallを実行してロックファイルを更新

## パッケージのコンパイル戦略

### ジャストインタイム（JIT）

TypeScriptを直接エクスポートする。利用側アプリのバンドラーがコンパイルする。

```json
// packages/ui/package.json
{
  "name": "@repo/ui",
  "exports": {
    "./button": "./src/button.tsx",
    "./card": "./src/card.tsx"
  },
  "scripts": {
    "lint": "eslint .",
    "check-types": "tsc --noEmit"
  }
}
```

**使用すべき場合:**

- アプリがモダンなバンドラー（Turbopack, webpack, Vite）を使用している
- 最小限の設定にしたい
- キャッシュなしでもビルド時間が許容範囲内

**制限事項:**

- パッケージ自体のTurborepoキャッシュが使えない
- コンシューマーがTypeScriptコンパイルをサポートしている必要がある
- TypeScriptの `paths` は使えない（代わりにNode.jsのサブパスインポートを使用）

### コンパイル済み

パッケージ自身がコンパイルを行う。

```json
// packages/ui/package.json
{
  "name": "@repo/ui",
  "exports": {
    "./button": {
      "types": "./src/button.tsx",
      "default": "./dist/button.js"
    }
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  }
}
```

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

**使用すべき場合:**

- Turborepoでビルドをキャッシュしたい
- バンドラー以外のツールからも利用される
- 最大限の互換性が必要

**注意:** turbo.jsonのoutputsに `dist/**` を追加すること！

## エクスポートの定義

### 複数のエントリーポイント

```json
{
  "exports": {
    ".": "./src/index.ts",           // @repo/ui
    "./button": "./src/button.tsx",  // @repo/ui/button
    "./card": "./src/card.tsx",      // @repo/ui/card
    "./hooks": "./src/hooks/index.ts" // @repo/ui/hooks
  }
}
```

### 条件付きエクスポート（コンパイル済み）

```json
{
  "exports": {
    "./button": {
      "types": "./src/button.tsx",
      "import": "./dist/button.mjs",
      "require": "./dist/button.cjs",
      "default": "./dist/button.js"
    }
  }
}
```

## 内部パッケージのインストール

### 利用側パッケージに追加

```json
// apps/web/package.json
{
  "dependencies": {
    "@repo/ui": "workspace:*"  // pnpm/bun
    // "@repo/ui": "*"         // npm/yarn
  }
}
```

### インストールの実行

```bash
pnpm install  # 新しい依存関係でロックファイルを更新
```

### インポートして使用

```typescript
// apps/web/src/page.tsx
import { Button } from '@repo/ui/button';

export default function Page() {
  return <Button>Click me</Button>;
}
```

## 1パッケージ1目的

### 良い例

```
packages/
├── ui/                  # 共有UIコンポーネント
├── utils/               # 汎用ユーティリティ
├── auth/                # 認証ロジック
├── database/            # データベースクライアント/スキーマ
├── eslint-config/       # ESLint設定
├── typescript-config/   # TypeScript設定
└── api-client/          # 生成されたAPIクライアント
```

### 巨大パッケージを避ける

```
// 悪い例: すべてを1つのパッケージに
packages/
└── shared/
    ├── components/
    ├── utils/
    ├── hooks/
    ├── types/
    └── api/

// 良い例: 目的ごとに分離
packages/
├── ui/          # コンポーネント
├── utils/       # ユーティリティ
├── hooks/       # Reactフック
├── types/       # 共有TypeScript型
└── api-client/  # APIユーティリティ
```

## 設定パッケージ

### TypeScript設定

```json
// packages/typescript-config/package.json
{
  "name": "@repo/typescript-config",
  "exports": {
    "./base.json": "./base.json",
    "./nextjs.json": "./nextjs.json",
    "./library.json": "./library.json"
  }
}
```

### ESLint設定

```json
// packages/eslint-config/package.json
{
  "name": "@repo/eslint-config",
  "exports": {
    "./base": "./base.js",
    "./next": "./next.js"
  },
  "dependencies": {
    "eslint": "^8.0.0",
    "eslint-config-next": "latest"
  }
}
```

## よくあるミス

### エクスポートの定義忘れ

```json
// 悪い例: exportsが未定義
{
  "name": "@repo/ui"
}

// 良い例: 明確なexports
{
  "name": "@repo/ui",
  "exports": {
    "./button": "./src/button.tsx"
  }
}
```

### ワークスペース構文の誤り

```json
// pnpm/bun
{ "@repo/ui": "workspace:*" }  // 正しい

// npm/yarn
{ "@repo/ui": "*" }            // 正しい
{ "@repo/ui": "workspace:*" }  // npm/yarnでは間違い！
```

### turbo.jsonのoutputsへの追加漏れ

```json
// パッケージがdist/にビルドするが、turbo.jsonが認識していない
{
  "tasks": {
    "build": {
      "outputs": [".next/**"]  // dist/**が不足！
    }
  }
}

// 正しい
{
  "tasks": {
    "build": {
      "outputs": [".next/**", "dist/**"]
    }
  }
}
```

## TypeScriptのベストプラクティス

### Node.jsサブパスインポートを使用（`paths` ではなく）

TypeScriptの `compilerOptions.paths` はJITパッケージで動作しない。代わりにNode.jsサブパスインポートを使用する（TypeScript 5.4以降）。

**JITパッケージ:**

```json
// packages/ui/package.json
{
  "imports": {
    "#*": "./src/*"
  }
}
```

```typescript
// packages/ui/button.tsx
import { MY_STRING } from "#utils.ts";  // .ts拡張子を使用
```

**コンパイル済みパッケージ:**

```json
// packages/ui/package.json
{
  "imports": {
    "#*": "./dist/*"
  }
}
```

```typescript
// packages/ui/button.tsx
import { MY_STRING } from "#utils.js";  // .js拡張子を使用
```

### 内部パッケージには `tsc` を使用

内部パッケージには、バンドラーよりも `tsc` を推奨する。バンドラーはアプリのバンドラーに到達する前にコードを変換してしまい、デバッグが困難な問題を引き起こす可能性がある。

### 定義元へのジャンプを有効にする

コンパイル済みパッケージの場合、宣言マップを有効にする:

```json
// tsconfig.json
{
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true
  }
}
```

これにより `.d.ts` と `.d.ts.map` ファイルが生成され、IDEでのナビゲーションが可能になる。

### ルートのtsconfig.jsonは不要

各パッケージが独自の `tsconfig.json` を持つべきである。ルートに配置すると、変更時にすべてのタスクのキャッシュが無効化される。ルートの `tsconfig.json` はパッケージ外のスクリプトにのみ使用する。

### TypeScriptプロジェクト参照を避ける

複雑さが増し、別のキャッシュレイヤーが追加される。Turborepoの方が依存関係をうまく管理できる。
