# turbo.json 設定の概要

Turborepoの設定リファレンス。完全なドキュメント: https://turborepo.dev/docs/reference/configuration

## ファイルの配置場所

ルートの `turbo.json` はリポジトリのルートに配置し、ルートの `package.json` と同階層に置く：

```
my-monorepo/
├── turbo.json        # ルート設定
├── package.json
└── packages/
    └── web/
        ├── turbo.json  # パッケージ設定（オプション）
        └── package.json
```

## パッケージタスクを常にルートタスクより優先する

**常にパッケージタスクを使用すること。ルートタスクはパッケージタスクで対応できない場合にのみ使用する。**

パッケージタスクは並列化、個別キャッシュ、フィルタリングを可能にする。各パッケージの `package.json` にスクリプトを定義する：

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

```json
// ルートの package.json - turboに委譲
{
  "scripts": {
    "build": "turbo run build",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "typecheck": "turbo run typecheck"
  }
}
```

`turbo run lint` を実行すると、Turborepoは `lint` スクリプトを持つすべてのパッケージを見つけ、**並列**で実行する。

**ルートタスクはフォールバックであり**、デフォルトではない。パッケージ単位で実行できないタスク（例：リポジトリレベルのCIスクリプト、ワークスペース全体の設定生成）にのみ使用する。

```json
// 避けるべき: ルートにタスクロジックを置くと並列化が無効になる
{
  "scripts": {
    "lint": "eslint apps/web && eslint apps/api && eslint packages/ui"
  }
}
```

## 基本構造

```json
{
  "$schema": "https://turborepo.dev/schema.v2.json",
  "globalEnv": ["CI"],
  "globalDependencies": ["tsconfig.json"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

`$schema` キーはIDEの自動補完とバリデーションを有効にする。

## 設定セクション

**グローバルオプション** - すべてのタスクに影響する設定：

- `globalEnv`, `globalDependencies`, `globalPassThroughEnv`
- `cacheDir`, `daemon`, `envMode`, `ui`, `remoteCache`

**タスク定義** - `tasks` オブジェクト内のタスクごとの設定：

- `dependsOn`, `outputs`, `inputs`, `env`
- `cache`, `persistent`, `interactive`, `outputLogs`

## パッケージ設定

個別のパッケージ内の `turbo.json` でルート設定を上書きする：

```json
// packages/web/turbo.json
{
  "extends": ["//"],
  "tasks": {
    "build": {
      "outputs": [".next/**", "!.next/cache/**"]
    }
  }
}
```

`"extends": ["//"]` は必須 - ルート設定を参照する。

**パッケージ設定を使うべきケース：**

- フレームワーク固有の出力（Next.js、Viteなど）
- パッケージ固有の環境変数
- 特定パッケージでの異なるキャッシュルール
- フレームワーク設定をフレームワークコードの近くに置きたい場合

### 他のパッケージからの拡張

ルートだけでなく設定パッケージからも拡張できる：

```json
// packages/web/turbo.json
{
  "extends": ["//", "@repo/turbo-config"]
}
```

### `$TURBO_EXTENDS$` による継承配列への追加

デフォルトでは、パッケージ設定の配列フィールドはルートの値を**置換**する。`$TURBO_EXTENDS$` を使うと代わりに**追加**できる：

```json
// ルートの turbo.json
{
  "tasks": {
    "build": {
      "outputs": ["dist/**"]
    }
  }
}
```

```json
// packages/web/turbo.json
{
  "extends": ["//"],
  "tasks": {
    "build": {
      // ルートの "dist/**" を継承し、".next/**" を追加
      "outputs": ["$TURBO_EXTENDS$", ".next/**", "!.next/cache/**"]
    }
  }
}
```

`$TURBO_EXTENDS$` がない場合、outputsは `[".next/**", "!.next/cache/**"]` のみになる。

**対応するフィールド：**

- `dependsOn`
- `env`
- `inputs`
- `outputs`
- `passThroughEnv`
- `with`

### パッケージからのタスク除外

`extends: false` を使ってパッケージからタスクを除外する：

```json
// packages/ui/turbo.json
{
  "extends": ["//"],
  "tasks": {
    "e2e": {
      "extends": false  // UIパッケージにはe2eテストがない
    }
  }
}
```

## コメント付きの `turbo.jsonc`

IDE対応のコメントを追加するには `turbo.jsonc` 拡張子を使用する：

```jsonc
// turbo.jsonc
{
  "tasks": {
    "build": {
      // Next.jsの出力
      "outputs": [".next/**", "!.next/cache/**"]
    }
  }
}
```
