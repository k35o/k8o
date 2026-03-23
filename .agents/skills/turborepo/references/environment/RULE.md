# Turborepoの環境変数

Turborepoは、どの環境変数がタスクのハッシュとランタイムの利用可能性に影響するかを細かく制御できます。

## 設定キー

### `env` - タスク固有の変数

特定のタスクのハッシュに影響する変数。これらが変更されると、そのタスクのみが再ビルドされます。

```json
{
  "tasks": {
    "build": {
      "env": ["DATABASE_URL", "API_KEY"]
    }
  }
}
```

### `globalEnv` - すべてのタスクに影響する変数

すべてのタスクのハッシュに影響する変数。これらが変更されると、全タスクが再ビルドされます。

```json
{
  "globalEnv": ["CI", "NODE_ENV"]
}
```

### `passThroughEnv` - ランタイム専用変数（ハッシュに含まれない）

ランタイムでは利用可能だが、ハッシュには含まれない変数。**注意して使用してください** - 変更しても再ビルドはトリガーされません。

```json
{
  "tasks": {
    "deploy": {
      "passThroughEnv": ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"]
    }
  }
}
```

### `globalPassThroughEnv` - グローバルランタイム変数

`passThroughEnv`と同じですが、すべてのタスクに適用されます。

```json
{
  "globalPassThroughEnv": ["GITHUB_TOKEN"]
}
```

## ワイルドカードと否定

### ワイルドカード

`*`で複数の変数にマッチ:

```json
{
  "env": ["MY_API_*", "FEATURE_FLAG_*"]
}
```

これは`MY_API_URL`、`MY_API_KEY`、`FEATURE_FLAG_DARK_MODE`などにマッチします。

### 否定

変数を除外（フレームワーク推論と組み合わせて便利）:

```json
{
  "env": ["!NEXT_PUBLIC_ANALYTICS_ID"]
}
```

## 完全な設定例

```json
{
  "$schema": "https://turborepo.dev/schema.v2.json",
  "globalEnv": ["CI", "NODE_ENV"],
  "globalPassThroughEnv": ["GITHUB_TOKEN", "NPM_TOKEN"],
  "tasks": {
    "build": {
      "env": ["DATABASE_URL", "API_*"],
      "passThroughEnv": ["SENTRY_AUTH_TOKEN"]
    },
    "test": {
      "env": ["TEST_DATABASE_URL"]
    }
  }
}
```
