# 環境変数のよくある落とし穴

よくある間違いとその修正方法。

## .envファイルは`inputs`に含める必要がある

Turboは`.env`ファイルを読み込みません。フレームワーク（Next.js、Viteなど）や`dotenv`がそれらを読み込みます。しかしTurboは、それらが変更されたことを知る必要があります。

**間違い:**

```json
{
  "tasks": {
    "build": {
      "env": ["DATABASE_URL"]
    }
  }
}
```

**正しい:**

```json
{
  "tasks": {
    "build": {
      "env": ["DATABASE_URL"],
      "inputs": ["$TURBO_DEFAULT$", ".env", ".env.local", ".env.production"]
    }
  }
}
```

## Strictモードはci変数をフィルタリングする

Strictモードでは、CIプロバイダーの変数（GITHUB_TOKEN、GITLAB_CIなど）は明示的にリストしない限りフィルタリングされます。

**症状:** CIでタスクが「authentication required」や「permission denied」で失敗する。

**解決策:**

```json
{
  "globalPassThroughEnv": ["GITHUB_TOKEN", "GITLAB_CI", "CI"]
}
```

## passThroughEnvはハッシュに影響しない

`passThroughEnv`内の変数はランタイムで利用可能ですが、変更しても再ビルドはトリガーされません。

**危険な例:**

```json
{
  "tasks": {
    "build": {
      "passThroughEnv": ["API_URL"]
    }
  }
}
```

`API_URL`がステージングから本番に変更された場合、Turboは間違ったAPIを指すキャッシュされたビルドを提供する可能性があります。

**passThroughEnvは以下の場合のみ使用してください:**

- 出力に影響しない認証トークン（SENTRY_AUTH_TOKEN）
- CIメタデータ（GITHUB_RUN_ID）
- ビルド後に消費される変数（デプロイ認証情報）

## ランタイムで作成された変数は見えない

Turboは起動時に環境変数をキャプチャします。実行中に作成された変数は認識されません。

**動作しない:**

```bash
# package.jsonのscripts内
"build": "export API_URL=$COMPUTED_VALUE && next build"
```

**解決策:** turboを呼び出す前に変数を設定する:

```bash
API_URL=$COMPUTED_VALUE turbo run build
```

## 環境ごとに異なる.envファイル

`.env.development`と`.env.production`を使用している場合、両方をinputsに含める必要があります。

```json
{
  "tasks": {
    "build": {
      "inputs": [
        "$TURBO_DEFAULT$",
        ".env",
        ".env.local",
        ".env.development",
        ".env.development.local",
        ".env.production",
        ".env.production.local"
      ]
    }
  }
}
```

## Next.jsの完全な設定例

```json
{
  "$schema": "https://turborepo.dev/schema.v2.json",
  "globalEnv": ["CI", "NODE_ENV", "VERCEL"],
  "globalPassThroughEnv": ["GITHUB_TOKEN", "VERCEL_URL"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "env": [
        "DATABASE_URL",
        "NEXT_PUBLIC_*",
        "!NEXT_PUBLIC_ANALYTICS_ID"
      ],
      "passThroughEnv": ["SENTRY_AUTH_TOKEN"],
      "inputs": [
        "$TURBO_DEFAULT$",
        ".env",
        ".env.local",
        ".env.production",
        ".env.production.local"
      ],
      "outputs": [".next/**", "!.next/cache/**"]
    }
  }
}
```

この設定は以下を行います:

- DATABASE_URLとNEXT_PUBLIC_*変数をハッシュに含める（アナリティクスを除く）
- SENTRY_AUTH_TOKENをハッシュに含めずにパススルーする
- すべての.envファイルバリアントをハッシュに含める
- CIトークンをグローバルに利用可能にする
