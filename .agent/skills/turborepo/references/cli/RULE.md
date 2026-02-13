# turbo run

モノレポ全体でタスクを実行するための主要コマンド。

## 基本的な使い方

```bash
# フル形式（CI、package.json、スクリプトで使用）
turbo run <tasks>

# 省略形（ターミナルでの一度きりの実行のみ）
turbo <tasks>
```

## `turbo run` と `turbo` の使い分け

**コードに記述する場合は必ず `turbo run` を使用：**

- `package.json` のスクリプト
- CI/CDワークフロー（GitHub Actionsなど）
- シェルスクリプト
- ドキュメント
- 静的/コミット済みの設定ファイル全般

**`turbo`（省略形）を使って良いのは：**

- ターミナルで直接入力する一度きりのコマンド
- 人間やエージェントによるアドホックな実行

```json
// package.json - 必ず "turbo run" を使用
{
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "test": "turbo run test"
  }
}
```

```yaml
# CIワークフロー - 必ず "turbo run" を使用
- run: turbo run build --affected
- run: turbo run test --affected
```

```bash
# ターミナルでの一度きりの実行 - 省略形OK
turbo build --filter=web
```

## タスクの実行

タスクは実行前に `turbo.json` で定義されている必要がある。

```bash
# 単一タスク
turbo build

# 複数タスク
turbo run build lint test

# 利用可能なタスクを確認（引数なしで実行）
turbo run
```

## スクリプトへの引数の受け渡し

`--` を使って、基盤となるパッケージスクリプトに引数を渡す：

```bash
turbo run build -- --sourcemap
turbo test -- --watch
turbo lint -- --fix
```

`--` 以降のすべてがタスクのスクリプトに直接渡される。

## パッケージの選択

デフォルトでは、turboはすべてのパッケージでタスクを実行する。`--filter` でスコープを絞り込む：

```bash
turbo build --filter=web
turbo test --filter=./apps/*
```

完全なフィルター構文については `filtering/` を参照。

## クイックリファレンス

| 目的                    | コマンド                     |
| ----------------------- | ---------------------------- |
| すべてをビルド          | `turbo build`                |
| 1つのパッケージをビルド | `turbo build --filter=web`   |
| 複数タスク              | `turbo build lint test`      |
| スクリプトに引数を渡す  | `turbo build -- --arg`       |
| 実行のプレビュー        | `turbo build --dry`          |
| 強制リビルド            | `turbo build --force`        |
