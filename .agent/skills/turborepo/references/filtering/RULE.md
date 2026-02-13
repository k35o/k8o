# Turborepoフィルター構文リファレンス

## 変更されたパッケージのみ実行する: `--affected`

**変更されたパッケージのみを実行する主な方法は`--affected`です:**

```bash
# 変更されたパッケージとその依存先でのみbuild/test/lintを実行
turbo run build test lint --affected
```

これは現在のブランチをデフォルトブランチ（通常`main`または`master`）と比較し、以下でタスクを実行します:

1. ファイルに変更があるパッケージ
2. 変更されたパッケージに依存するパッケージ（依存先）

### なぜ依存先を含めるのか?

`@repo/ui`を変更した場合、`@repo/ui`をインポートしているパッケージ（例: `apps/web`）は、変更後も正しく動作することを確認するためにタスクを再実行する必要があります。

### --affectedのカスタマイズ

```bash
# 異なるベースブランチを使用
turbo run build --affected --affected-base=origin/develop

# 異なるhead（現在の状態）を使用
turbo run build --affected --affected-head=HEAD~5
```

### 一般的なCIパターン

```yaml
# .github/workflows/ci.yml
- run: turbo run build test lint --affected
```

これは最も効率的なCIセットアップです - 実際に変更されたもののみタスクを実行します。

---

## --filterによる手動Git比較

より細かい制御が必要な場合、`--filter`とgit比較構文を使用します:

```bash
# 変更されたパッケージ + 依存先（--affectedと同じ）
turbo run build --filter=...[origin/main]

# 変更されたパッケージのみ（依存先なし）
turbo run build --filter=[origin/main]

# 変更されたパッケージ + 依存元（インポートしているパッケージ）
turbo run build --filter=[origin/main]...

# 最後のコミット以降の変更
turbo run build --filter=...[HEAD^1]

# 2つのコミット間の変更
turbo run build --filter=[a1b2c3d...e4f5g6h]
```

### 比較構文

| 構文          | 意味                                  |
| ------------- | ------------------------------------- |
| `[ref]`       | `ref`以降に変更されたパッケージ       |
| `...[ref]`    | 変更されたパッケージ + その依存先     |
| `[ref]...`    | 変更されたパッケージ + その依存元     |
| `...[ref]...` | 依存元、変更されたもの、および依存先  |

---

## その他のフィルタータイプ

フィルターは`turbo run`の呼び出しに含めるパッケージを選択します。

### 基本構文

```bash
turbo run build --filter=<package-name>
turbo run build -F <package-name>
```

複数のフィルターは和集合として結合されます（いずれかのフィルターにマッチするパッケージが実行されます）。

### パッケージ名で指定

```bash
--filter=web          # 完全一致
--filter=@acme/*      # スコープのglob
--filter=*-app        # 名前のglob
```

### ディレクトリで指定

```bash
--filter=./apps/*           # apps/内のすべてのパッケージ
--filter=./packages/ui      # 特定のディレクトリ
```

### 依存元/依存先で指定

| 構文        | 意味                                   |
| ----------- | -------------------------------------- |
| `pkg...`    | パッケージとそのすべての依存元         |
| `...pkg`    | パッケージとそのすべての依存先         |
| `...pkg...` | 依存元、パッケージ、および依存先       |
| `^pkg...`   | 依存元のみ（pkg自体を除く）           |
| `...^pkg`   | 依存先のみ（pkg自体を除く）           |

### 否定

`!`でパッケージを除外:

```bash
--filter=!web              # webを除外
--filter=./apps/* --filter=!admin   # admin以外のapps
```

### タスク識別子

特定のパッケージで特定のタスクを実行:

```bash
turbo run web#build        # webのbuildタスクのみ
turbo run web#build api#test   # webのbuild + apiのtest
```

### フィルターの組み合わせ

複数の`--filter`フラグは和集合を作成します:

```bash
turbo run build --filter=web --filter=api   # 両方で実行
```

---

## クイックリファレンス: 変更されたパッケージ

| 目的                               | コマンド                                                    |
| ---------------------------------- | ----------------------------------------------------------- |
| 変更 + 依存先（推奨）             | `turbo run build --affected`                                |
| カスタムベースブランチ             | `turbo run build --affected --affected-base=origin/develop` |
| 変更のみ（依存先なし）            | `turbo run build --filter=[origin/main]`                    |
| 変更 + 依存元                     | `turbo run build --filter=[origin/main]...`                 |
| 最後のコミット以降                | `turbo run build --filter=...[HEAD^1]`                      |
