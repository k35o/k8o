# turbo watch

完全なドキュメント: https://turborepo.dev/docs/reference/watch

コードが変更されたときにタスクを自動的に再実行します。依存関係を認識します。

```bash
turbo watch [tasks]
```

## 基本的な使い方

```bash
# コードが変更されたときにbuildタスクを監視して再実行
turbo watch build

# 複数のタスクを監視
turbo watch build test lint
```

ソースファイルが変更されると、`turbo.json`で設定された順序でタスクが再実行されます。

## 永続タスクとの併用

永続タスク（`"persistent": true`）は終了しないため、他のタスクから依存されることができません。`turbo watch`でも`turbo run`と同じ動作をします。

### 依存関係を認識する永続タスク

ツールに組み込みのウォッチ機能がある場合（`next dev`など）、そのウォッチャーを使用します:

```json
{
  "tasks": {
    "dev": {
      "persistent": true,
      "cache": false
    }
  }
}
```

### 依存関係を認識しないツール

依存関係の変更を検出しないツールには、`interruptible`を使用します:

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

`turbo watch`は依存関係が変更されたときに、中断可能なタスクを再起動します。

## 制限事項

### キャッシュ

watchモードでのキャッシュは実験的機能です:

```bash
turbo watch your-tasks --experimental-write-cache
```

### ソース管理内のタスク出力

タスクがgitで追跡されているファイルを書き出す場合、watchモードが無限ループする可能性があります。watchモードはこれを防ぐためにファイルハッシュを使用しますが、完全ではありません。

**推奨事項**: タスク出力をgitから除外してください。

## turbo runとの比較

| 機能              | `turbo run` | `turbo watch` |
| ----------------- | ----------- | ------------- |
| 1回だけ実行       | はい        | いいえ        |
| 変更時に再実行    | いいえ      | はい          |
| キャッシュ        | 完全対応    | 実験的        |
| ユースケース      | CI、単発    | 開発          |

## よく使うパターン

### 開発ワークフロー

```bash
# devサーバーを実行し、ビルドの変更を監視
turbo watch dev build
```

### 開発中の型チェック

```bash
# 型チェックを監視して再実行
turbo watch check-types
```
