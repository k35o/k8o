# タスク設定リファレンス

完全なドキュメント: https://turborepo.dev/docs/reference/configuration#tasks

## dependsOn

タスクの実行順序を制御する。

```json
{
  "tasks": {
    "build": {
      "dependsOn": [
        "^build", // 依存パッケージのbuildタスクを先に実行
        "codegen", // 同一パッケージのcodegenタスクを先に実行
        "shared#build" // 特定パッケージのbuildタスク
      ]
    }
  }
}
```

| 構文       | 意味                                       |
| ---------- | ------------------------------------------ |
| `^task`    | すべての依存パッケージで `task` を先に実行 |
| `task`     | 同一パッケージで `task` を先に実行         |
| `pkg#task` | 特定パッケージの `task` を先に実行         |

`^` プレフィックスは重要 - これがないと同一パッケージを参照していることになる。

### 並列タスク用のトランジットノード

`lint` や `check-types` のように並列実行可能だが依存関係を考慮したキャッシュが必要なタスク向け：

```json
{
  "tasks": {
    "transit": { "dependsOn": ["^transit"] },
    "lint": { "dependsOn": ["transit"] },
    "check-types": { "dependsOn": ["transit"] }
  }
}
```

**`dependsOn: ["^lint"]` は使わないこと** - 逐次実行が強制される。
**`dependsOn: []` も使わないこと** - キャッシュの無効化が壊れる。

`transit` タスクは実際のスクリプトにマッチせずに依存関係を作成するため（スクリプトなし）、タスクは正しいキャッシュで並列実行される。

## outputs

キャッシュするファイルのglobパターン。**省略するとキャッシュされない。**

```json
{
  "tasks": {
    "build": {
      "outputs": ["dist/**", "build/**"]
    }
  }
}
```

**フレームワーク別の例：**

```json
// Next.js
"outputs": [".next/**", "!.next/cache/**"]

// Vite
"outputs": ["dist/**"]

// TypeScript (tsc)
"outputs": ["dist/**", "*.tsbuildinfo"]

// ファイル出力なし（lint、typecheck）
"outputs": []
```

`!` プレフィックスでキャッシュからパターンを除外する。

## inputs

タスクハッシュの計算時に考慮されるファイル。デフォルトはパッケージ内のすべてのトラッキングされたファイル。

```json
{
  "tasks": {
    "test": {
      "inputs": ["src/**", "tests/**", "vitest.config.ts"]
    }
  }
}
```

**特殊な値：**

| 値                    | 意味                                       |
| --------------------- | ------------------------------------------ |
| `$TURBO_DEFAULT$`     | デフォルトのinputsを含め、そこに追加/削除  |
| `$TURBO_ROOT$/<path>` | リポジトリルートのファイルを参照            |

```json
{
  "tasks": {
    "build": {
      "inputs": [
        "$TURBO_DEFAULT$",
        "!README.md",
        "$TURBO_ROOT$/tsconfig.base.json"
      ]
    }
  }
}
```

## env

タスクハッシュに含める環境変数。

```json
{
  "tasks": {
    "build": {
      "env": [
        "API_URL",
        "NEXT_PUBLIC_*", // ワイルドカードマッチ
        "!DEBUG" // ハッシュから除外
      ]
    }
  }
}
```

ここに記載された変数はキャッシュヒットに影響する - 値が変わるとキャッシュが無効化される。

## cache

タスクのキャッシュを有効/無効にする。デフォルト: `true`。

```json
{
  "tasks": {
    "dev": { "cache": false },
    "deploy": { "cache": false }
  }
}
```

無効にすべきもの: 開発サーバー、デプロイコマンド、副作用のあるタスク。

## persistent

終了しない長時間実行タスクをマークする。デフォルト: `false`。

```json
{
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

開発サーバーに必須 - これがないと依存タスクが永久に待ち続ける。

## interactive

タスクがstdin入力を受け取ることを許可する。デフォルト: `false`。

```json
{
  "tasks": {
    "login": {
      "cache": false,
      "interactive": true
    }
  }
}
```

## outputLogs

ログの表示タイミングを制御する。オプション: `full`、`hash-only`、`new-only`、`errors-only`、`none`。

```json
{
  "tasks": {
    "build": {
      "outputLogs": "new-only" // キャッシュミス時のみログを表示
    }
  }
}
```

## with

このタスクと一緒にタスクを実行する。ランタイム依存関係が必要な長時間実行タスク向け。

```json
{
  "tasks": {
    "dev": {
      "with": ["api#dev"],
      "persistent": true,
      "cache": false
    }
  }
}
```

`dependsOn` と異なり、`with` はタスクを（逐次ではなく）並行して実行する。他のサービスが実行中である必要がある開発サーバーに使用する。

## interruptible

`turbo watch` が変更時にタスクを再起動することを許可する。デフォルト: `false`。

```json
{
  "tasks": {
    "dev": {
      "persistent": true,
      "interruptible": true,
      "cache": false
    }
  }
}
```

依存関係の変更を自動検出しない開発サーバーに使用する。

## description

タスクの人間が読める説明。

```json
{
  "tasks": {
    "build": {
      "description": "Compiles the application for production deployment"
    }
  }
}
```

ドキュメント用のみ - 実行やキャッシュには影響しない。

## passThroughEnv

ランタイムで利用可能だがキャッシュハッシュには含まれない環境変数。

```json
{
  "tasks": {
    "build": {
      "passThroughEnv": ["AWS_SECRET_KEY", "GITHUB_TOKEN"]
    }
  }
}
```

**警告**: これらの変数の変更はキャッシュミスを引き起こさない。変更時にキャッシュを無効化すべき場合は `env` を使用する。

## extends（パッケージ設定のみ）

パッケージ設定でのタスク継承を制御する。

```json
// packages/ui/turbo.json
{
  "extends": ["//"],
  "tasks": {
    "lint": {
      "extends": false // このパッケージから除外
    }
  }
}
```

| 値                 | 動作                                                     |
| ------------------ | -------------------------------------------------------- |
| `true`（デフォルト）| ルートのturbo.jsonから継承                               |
| `false`            | パッケージからタスクを除外、または継承なしで新規に定義   |
