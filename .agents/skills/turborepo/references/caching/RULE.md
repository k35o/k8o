# Turborepoキャッシュの仕組み

Turborepoの基本原則: **同じ作業を二度としない**。

## キャッシュの方程式

```
fingerprint(inputs) → stored outputs
```

入力が変更されていなければ、タスクを再実行する代わりにキャッシュから出力を復元します。

## キャッシュキーの決定要因

### グローバルハッシュ入力

リポジトリ内の**すべてのタスク**に影響するもの:

- `package-lock.json` / `yarn.lock` / `pnpm-lock.yaml`
- `globalDependencies` に記載されたファイル
- `globalEnv` の環境変数
- `turbo.json` の設定

```json
{
  "globalDependencies": [".env", "tsconfig.base.json"],
  "globalEnv": ["CI", "NODE_ENV"]
}
```

### タスクハッシュ入力

特定のタスクに影響するもの:

- パッケージ内のすべてのファイル（`inputs` でフィルタリングされている場合を除く）
- `package.json` の内容
- タスクの `env` キーの環境変数
- タスク設定（コマンド、outputs、依存関係）
- 依存タスクのハッシュ（`dependsOn`）

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["src/**", "package.json", "tsconfig.json"],
      "env": ["API_URL"]
    }
  }
}
```

## キャッシュされるもの

1. **ファイル出力** - `outputs` で指定されたファイル/ディレクトリ
2. **タスクログ** - キャッシュヒット時に再生するためのstdout/stderr

```json
{
  "tasks": {
    "build": {
      "outputs": ["dist/**", ".next/**"]
    }
  }
}
```

## ローカルキャッシュの場所

```
.turbo/cache/
├── <hash1>.tar.zst    # 圧縮された出力
├── <hash2>.tar.zst
└── ...
```

`.turbo` を `.gitignore` に追加してください。

## キャッシュの復元

キャッシュヒット時、Turborepoは以下を行います:

1. アーカイブされた出力を元の場所に展開
2. 記録されたstdout/stderrを再生
3. タスクをキャッシュ済みとして報告（出力に `FULL TURBO` と表示）

## フローの例

```bash
# 初回実行 - ビルドを実行し、結果をキャッシュ
turbo build
# → packages/ui: cache miss, executing...
# → packages/web: cache miss, executing...

# 2回目の実行 - 同じ入力なので、キャッシュから復元
turbo build
# → packages/ui: cache hit, replaying output
# → packages/web: cache hit, replaying output
# → FULL TURBO
```

## 重要なポイント

- キャッシュはコンテンツアドレス方式（タイムスタンプではなく入力ハッシュに基づく）
- 空の `outputs` 配列はタスクが実行されるがキャッシュされないことを意味する
- `outputs` キーがないタスクは何もキャッシュしない（明示的に `"outputs": []` を使用すること）
- **いずれかの**入力が変更されるとキャッシュは無効化される
