# キャッシュ問題のデバッグ

## 診断ツール

### `--summarize`

すべてのハッシュ入力を含むJSONファイルを生成します。2回の実行結果を比較して差分を見つけます。

```bash
turbo build --summarize
# .turbo/runs/<run-id>.json を生成
```

サマリーには以下が含まれます:

- グローバルハッシュとその入力
- タスクごとのハッシュとその入力
- ハッシュに影響した環境変数

**実行結果の比較:**

```bash
# 2回実行して、サマリーを比較する
diff .turbo/runs/<first-run>.json .turbo/runs/<second-run>.json
```

### `--dry` / `--dry=json`

実際に実行せずに何が実行されるかを確認します:

```bash
turbo build --dry
turbo build --dry=json  # 機械可読な出力
```

タスクを実行せずに各タスクのキャッシュ状態を表示します。

### `--force`

キャッシュの読み取りをスキップし、すべてのタスクを再実行します:

```bash
turbo build --force
```

タスクが実際に動作するか（キャッシュ結果だけでなく）確認するのに便利です。

## 予期しないキャッシュミス

**症状:** キャッシュヒットを期待していたのにタスクが実行される。

### 環境変数が変更された

`env` キーの環境変数が変更されていないか確認します:

```json
{
  "tasks": {
    "build": {
      "env": ["API_URL", "NODE_ENV"]
    }
  }
}
```

実行間で `API_URL` が異なる = キャッシュミス。

### .envファイルが変更された

`.env` ファイルはデフォルトでは追跡されません。`inputs` に追加してください:

```json
{
  "tasks": {
    "build": {
      "inputs": ["$TURBO_DEFAULT$", ".env", ".env.local"]
    }
  }
}
```

または、リポジトリ全体のenvファイルには `globalDependencies` を使用します:

```json
{
  "globalDependencies": [".env"]
}
```

### ロックファイルが変更された

パッケージのインストール/更新はグローバルハッシュを変更します。

### ソースファイルが変更された

パッケージ内（または `inputs` 内）のいずれかのファイルが変更されるとミスが発生します。

### turbo.jsonが変更された

設定の変更はグローバルハッシュを無効化します。

## 誤ったキャッシュヒット

**症状:** キャッシュされた出力が古い/正しくない。

### 環境変数の記載漏れ

タスクが `env` に記載されていない環境変数を使用している:

```javascript
// build.js
const apiUrl = process.env.API_URL;  // 追跡されていない！
```

修正: タスク設定に追加する:

```json
{
  "tasks": {
    "build": {
      "env": ["API_URL"]
    }
  }
}
```

### inputsにファイルが記載されていない

タスクがデフォルトのinputs外のファイルを読み取っている:

```json
{
  "tasks": {
    "build": {
      "inputs": [
        "$TURBO_DEFAULT$",
        "../../shared-config.json"  // パッケージ外のファイル
      ]
    }
  }
}
```

## 便利なフラグ

```bash
# キャッシュミスの出力のみ表示
turbo build --output-logs=new-only

# すべての出力を表示（デバッグ用）
turbo build --output-logs=full

# タスクが実行される理由を確認
turbo build --verbosity=2
```

## クイックチェックリスト

ヒットを期待していたのにキャッシュミスが発生した場合:

1. `--summarize` で実行し、前回の実行結果と比較する
2. `--dry=json` で環境変数を確認する
3. gitでロックファイル/設定の変更を確認する

ミスを期待していたのにキャッシュヒットが発生した場合:

1. 環境変数が `env` 配列に含まれているか確認する
2. ファイルが `inputs` 配列に含まれているか確認する
3. ファイルがパッケージディレクトリの外にないか確認する
