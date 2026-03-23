# Vercelデプロイ

Turborepoはモノレポのデプロイ時にVercelとシームレスに統合される。

## リモートキャッシュ

Vercelへのデプロイ時、リモートキャッシュは**自動的に有効化**される。設定は不要 - VercelがTurborepoを検出し、キャッシュを有効にする。

これにより:

- Vercel上での `TURBO_TOKEN` や `TURBO_TEAM` の設定が不要
- キャッシュはすべてのデプロイ間で共有
- プレビューと本番ビルドの両方がキャッシュの恩恵を受ける

## turbo-ignore

`turbo-ignore` を使用して、パッケージに変更がない場合に不要なビルドをスキップする。

### インストール

```bash
npx turbo-ignore
```

またはプロジェクトにグローバルインストール:

```bash
pnpm add -D turbo-ignore
```

### Vercelでのセットアップ

1. Vercelダッシュボードでプロジェクトにアクセス
2. Settings > Git > Ignored Build Step に移動
3. 「Custom」を選択して以下を入力:

```bash
npx turbo-ignore
```

### 仕組み

`turbo-ignore` は、現在のパッケージ（またはその依存関係）が最後の成功したデプロイ以降に変更されたかどうかを確認する:

1. 現在のコミットと最後にデプロイされたコミットを比較
2. Turborepoの依存関係グラフを使用
3. 変更がなければ終了コード0（スキップ）を返す
4. 変更が検出されれば終了コード1（ビルド）を返す

### オプション

```bash
# 特定のパッケージを確認
npx turbo-ignore web

# 特定の比較参照を使用
npx turbo-ignore --fallback=HEAD~1

# 詳細な出力
npx turbo-ignore --verbose
```

## 環境変数

Vercelダッシュボードで環境変数を設定:

1. Project Settings > Environment Variables にアクセス
2. 各環境（Production、Preview、Development）に変数を追加

一般的な変数:

- `DATABASE_URL`
- `API_KEY`
- パッケージ固有の設定

## モノレポのルートディレクトリ

モノレポの場合、Vercelでルートディレクトリを設定:

1. Project Settings > General > Root Directory
2. パッケージのパスを設定（例: `apps/web`）

Vercelが自動的に:

- モノレポのルートから依存関係をインストール
- パッケージディレクトリからビルドを実行
- フレームワーク設定を検出

## ビルドコマンド

ルートに `turbo.json` が存在する場合、Vercelは `turbo run build` を自動検出する。

必要に応じてオーバーライド:

```bash
turbo run build --filter=web
```

または本番環境専用の最適化:

```bash
turbo run build --filter=web --env-mode=strict
```
