# turbo run フラグリファレンス

完全なドキュメント: https://turborepo.dev/docs/reference/run

## パッケージの選択

### `--filter` / `-F`

タスクを実行する特定のパッケージを選択する。

```bash
turbo build --filter=web
turbo build -F=@repo/ui -F=@repo/utils
turbo test --filter=./apps/*
```

完全な構文（glob、依存関係、gitレンジ）については `filtering/` を参照。

### タスク識別子構文 (v2.2.4+)

特定のパッケージタスクを直接実行する：

```bash
turbo run web#build              # webパッケージをビルド
turbo run web#build docs#lint    # 複数の特定タスク
```

### `--affected`

ベースブランチから変更があったパッケージでのみ実行する。

```bash
turbo build --affected
turbo test --affected --filter=./apps/*  # filterと組み合わせ
```

**動作の仕組み：**

- デフォルト: `main...HEAD` と比較
- GitHub Actionsでは: `GITHUB_BASE_REF` を自動検出
- ベースの上書き: `TURBO_SCM_BASE=development turbo build --affected`
- ヘッドの上書き: `TURBO_SCM_HEAD=your-branch turbo build --affected`

**gitの履歴が必要** - シャロークローンではすべてのタスクを実行するフォールバックが発生する場合がある。

## 実行制御

### `--dry` / `--dry=json`

実行せずに何が実行されるかをプレビューする。

```bash
turbo build --dry          # 人間が読みやすい形式
turbo build --dry=json     # 機械が読みやすい形式
```

### `--force`

キャッシュされたすべてのアーティファクトを無視し、すべてを再実行する。

```bash
turbo build --force
```

### `--concurrency`

並列タスク実行数を制限する。

```bash
turbo build --concurrency=4      # 最大4タスク
turbo build --concurrency=50%    # CPUコアの50%
```

### `--continue`

1つのタスクが失敗しても他のタスクの実行を続ける。

```bash
turbo build test --continue
```

### `--only`

指定されたタスクのみを実行し、その依存タスクをスキップする。

```bash
turbo build --only  # dependsOnのタスクをスキップ
```

### `--parallel` (非推奨)

タスクグラフの依存関係を無視し、すべてのタスクを同時に実行する。**このフラグの使用は避けること**—タスクを並列実行する必要がある場合は、代わりに `dependsOn` を正しく設定すること。`--parallel` を使用するとTurborepoの依存関係グラフがバイパスされ、レースコンディションや不正なビルドが発生する可能性がある。

## キャッシュ制御

### `--cache`

きめ細かなキャッシュ動作の制御。

```bash
# デフォルト: ローカルとリモートの両方で読み書き
turbo build --cache=local:rw,remote:rw

# ローカルは読み取り専用、リモートは無効
turbo build --cache=local:r,remote:

# ローカルを無効、リモートは読み取り専用
turbo build --cache=local:,remote:r

# すべてのキャッシュを無効化
turbo build --cache=local:,remote:
```

## 出力とデバッグ

### `--graph`

タスクグラフの可視化を生成する。

```bash
turbo build --graph                # ブラウザで開く
turbo build --graph=graph.svg      # SVGファイル
turbo build --graph=graph.png      # PNGファイル
turbo build --graph=graph.json     # JSONデータ
turbo build --graph=graph.mermaid  # Mermaidダイアグラム
```

### `--summarize`

デバッグ用のJSON実行サマリーを生成する。

```bash
turbo build --summarize
# .turbo/runs/<run-id>.json を作成
```

### `--output-logs`

ログ出力の詳細度を制御する。

```bash
turbo build --output-logs=full        # すべてのログ（デフォルト）
turbo build --output-logs=new-only    # キャッシュミスのみ
turbo build --output-logs=errors-only # 失敗のみ
turbo build --output-logs=none        # サイレント
```

### `--profile`

パフォーマンス分析用のChromeトレーシングプロファイルを生成する。

```bash
turbo build --profile=profile.json
# chrome://tracing を開いてファイルを読み込む
```

### `--verbosity` / `-v`

turbo自体のログレベルを制御する。

```bash
turbo build -v      # 詳細
turbo build -vv     # より詳細
turbo build -vvv    # 最大詳細度
```

## 環境変数

### `--env-mode`

環境変数の扱いを制御する。

```bash
turbo build --env-mode=strict  # 宣言された環境変数のみ（デフォルト）
turbo build --env-mode=loose   # すべての環境変数をハッシュに含める
```

## UI

### `--ui`

出力インターフェースを選択する。

```bash
turbo build --ui=tui     # インタラクティブなターミナルUI（TTYでのデフォルト）
turbo build --ui=stream  # ストリーミングログ（CIでのデフォルト）
```

---

# turbo-ignore

完全なドキュメント: https://turborepo.dev/docs/reference/turbo-ignore

関連する変更がない場合にCIの作業をスキップする。コンテナセットアップのスキップに便利。

## 基本的な使い方

```bash
# 現在のパッケージにビルドが必要か確認する（自動パッケージスコーピングを使用）
npx turbo-ignore

# 特定のパッケージを確認
npx turbo-ignore web

# 特定のタスクを確認
npx turbo-ignore --task=test
```

## 終了コード

- `0`: 変更が検出されなかった - CIの作業をスキップ
- `1`: 変更が検出された - CIを続行

## CI統合の例

```yaml
# GitHub Actions
- name: Check for changes
  id: turbo-ignore
  run: npx turbo-ignore web
  continue-on-error: true

- name: Build
  if: steps.turbo-ignore.outcome == 'failure'  # 変更が検出された
  run: pnpm build
```

## 比較の深さ

デフォルト: 親コミット (`HEAD^1`) と比較。

```bash
# 特定のコミットと比較
npx turbo-ignore --fallback=abc123

# ブランチと比較
npx turbo-ignore --fallback=main
```

---

# その他のコマンド

## turbo boundaries

ワークスペース違反をチェックする（実験的）。

```bash
turbo boundaries
```

設定については `references/boundaries/` を参照。

## turbo watch

ファイルの変更時にタスクを再実行する。

```bash
turbo watch build test
```

詳細は `references/watch/` を参照。

## turbo prune

Docker用のスパースチェックアウトを作成する。

```bash
turbo prune web --docker
```

## turbo link / unlink

リモートキャッシュの接続/切断。

```bash
turbo link    # Vercelリモートキャッシュに接続
turbo unlink  # 切断
```

## turbo login / logout

リモートキャッシュプロバイダーとの認証。

```bash
turbo login   # 認証
turbo logout  # ログアウト
```

## turbo generate

新しいパッケージをスキャフォールドする。

```bash
turbo generate
```
