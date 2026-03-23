# TurborepoによるCI/CD

継続的インテグレーション環境でTurborepoを実行するための一般原則。

## 基本原則

### CIでは必ず `turbo run` を使用する

**CIやスクリプトでは `turbo <tasks>` の省略形を絶対に使わないこと。** 必ず `turbo run` を使用する:

```bash
# 正しい - CI、package.json、スクリプトでは常にこちらを使用
turbo run build test lint

# 間違い - 省略形はターミナルでの一回限りのコマンド専用
turbo build test lint
```

省略形 `turbo <tasks>` は、人間やエージェントがターミナルで直接入力する一回限りの実行専用。コマンドがコードに記述される場所（CI、package.json、スクリプト）では、`turbo run` を使用すること。

### リモートキャッシュを有効にする

リモートキャッシュは、実行間でキャッシュ成果物を共有することでCIを大幅に高速化する。

必要な環境変数:

```bash
TURBO_TOKEN=your_vercel_token
TURBO_TEAM=your_team_slug
```

### PRビルドでは --affected を使用する

`--affected` フラグは、ベースブランチから変更されたパッケージのタスクのみを実行する:

```bash
turbo run build test --affected
```

これには変更内容を計算するためのGit履歴が必要。

## Git履歴の要件

### フェッチ深度

`--affected` はマージベースにアクセスする必要がある。浅いクローンではこれが機能しない。

```yaml
# GitHub Actions
- uses: actions/checkout@v4
  with:
    fetch-depth: 2  # --affected に必要な最小値
    # マージベースが遠い場合は 0 で完全な履歴を取得
```

### 浅いクローンで --affected が機能しない理由

Turborepoは現在のHEADと `main` とのマージベースを比較する。そのコミットがフェッチされていない場合、`--affected` はすべてを実行するフォールバック動作になる。

コミット数が多いPRの場合は以下を検討:

```yaml
fetch-depth: 0  # 完全な履歴
```

## 環境変数リファレンス

| 変数                | 用途                                     |
| ------------------- | ---------------------------------------- |
| `TURBO_TOKEN`       | リモートキャッシュ用のVercelアクセストークン |
| `TURBO_TEAM`        | Vercelチームのスラッグ                     |
| `TURBO_REMOTE_ONLY` | ローカルキャッシュをスキップし、リモートのみ使用 |
| `TURBO_LOG_ORDER`   | `grouped` に設定するとCIログが見やすくなる   |

## 関連ドキュメント

- [github-actions.md](./github-actions.md) - GitHub Actionsの設定
- [vercel.md](./vercel.md) - Vercelデプロイ
- [patterns.md](./patterns.md) - CI最適化パターン
