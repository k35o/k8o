# リモートキャッシュ

キャッシュアーティファクトをチーム全体やCIパイプラインで共有します。

## メリット

- チームメンバーが互いの作業結果からキャッシュヒットを得られる
- CIがローカル開発のキャッシュヒットを利用できる（逆も同様）
- 初回ビルド以降のCIの実行時間が大幅に短縮される
- 「自分の環境では動く」による再ビルドが不要になる

## Vercelリモートキャッシュ

Vercelにデプロイしている場合、無料でゼロコンフィグ。ローカル開発やその他のCIでの設定:

### ローカル開発のセットアップ

```bash
# Vercelで認証
npx turbo login

# リポジトリをVercelチームにリンク
npx turbo link
```

これにより、チーム情報を含む `.turbo/config.json` が作成されます（デフォルトでgitignore済み）。

### CIのセットアップ

以下の環境変数を設定します:

```bash
TURBO_TOKEN=<your-token>
TURBO_TEAM=<your-team-slug>
```

トークンはVercelダッシュボード → Settings → Tokensから取得します。

**GitHub Actionsの例:**

```yaml
- name: Build
  run: npx turbo build
  env:
    TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
    TURBO_TEAM: ${{ vars.TURBO_TEAM }}
```

## turbo.jsonでの設定

```json
{
  "remoteCache": {
    "enabled": true,
    "signature": false
  }
}
```

オプション:

- `enabled`: リモートキャッシュの有効/無効を切り替え（デフォルト: 認証済みの場合true）
- `signature`: アーティファクトの署名を要求（デフォルト: false）

## アーティファクト署名

キャッシュアーティファクトが改ざんされていないことを検証します:

```bash
# シークレットキーを設定（すべての環境で同じキーを使用）
export TURBO_REMOTE_CACHE_SIGNATURE_KEY="your-secret-key"
```

設定で有効化:

```json
{
  "remoteCache": {
    "signature": true
  }
}
```

署名されたアーティファクトは、署名が一致する場合にのみ復元できます。

## セルフホストオプション

独自のキャッシュサーバーを運用するためのコミュニティ実装:

- **turbo-remote-cache** (Node.js) - S3、GCS、Azureをサポート
- **turborepo-remote-cache** (Go) - 軽量、S3互換
- **ducktape** (Rust) - 高パフォーマンスオプション

環境変数で設定:

```bash
TURBO_API=https://your-cache-server.com
TURBO_TOKEN=your-auth-token
TURBO_TEAM=your-team
```

## キャッシュ動作の制御

```bash
# この実行でリモートキャッシュを無効化
turbo build --remote-cache-read-only  # 読み取りのみ、書き込みなし
turbo build --no-cache                # キャッシュを完全にスキップ

# 環境変数での代替
TURBO_REMOTE_ONLY=true  # リモートのみ使用、ローカルをスキップ
```

## リモートキャッシュのデバッグ

```bash
# 詳細出力でキャッシュ操作を確認
turbo build --verbosity=2

# リモートキャッシュが設定されているか確認
turbo config
```

確認すべきポイント:

- 出力に「Remote caching enabled」が表示されること
- 実行中にアップロード/ダウンロードのメッセージが表示されること
- リモートキャッシュインジケーター付きの「cache hit, replaying output」が表示されること
