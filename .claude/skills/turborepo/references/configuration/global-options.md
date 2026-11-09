# グローバルオプションリファレンス

すべてのタスクに影響するオプション。完全なドキュメント: https://turborepo.dev/docs/reference/configuration

## globalEnv

すべてのタスクハッシュに影響する環境変数。

```json
{
  "globalEnv": ["CI", "NODE_ENV", "VERCEL_*"]
}
```

変更時にすべてのキャッシュを無効化すべき変数に使用する。

## globalDependencies

すべてのタスクハッシュに影響するファイル。

```json
{
  "globalDependencies": ["tsconfig.json", ".env", "pnpm-lock.yaml"]
}
```

ロックファイルはデフォルトで含まれる。共有設定ファイルをここに追加する。

## globalPassThroughEnv

タスクで利用可能だがハッシュには含まれない変数。

```json
{
  "globalPassThroughEnv": ["AWS_SECRET_KEY", "GITHUB_TOKEN"]
}
```

キャッシュキーに影響すべきでない認証情報に使用する。

## cacheDir

カスタムキャッシュの保存場所。デフォルト: `node_modules/.cache/turbo`。

```json
{
  "cacheDir": ".turbo/cache"
}
```

## daemon

後続の実行を高速化するバックグラウンドプロセス。デフォルト: `true`。

```json
{
  "daemon": false
}
```

CIまたはデバッグ時に無効にする。

## envMode

未指定の環境変数の扱い方。デフォルト: `"strict"`。

```json
{
  "envMode": "strict"  // 指定された変数のみ利用可能
  // または
  "envMode": "loose"   // すべての変数がパススルー
}
```

Strictモードは環境変数宣言の漏れを検出する。

## ui

ターミナルUIモード。デフォルト: `"stream"`。

```json
{
  "ui": "tui"     // インタラクティブなターミナルUI
  // または
  "ui": "stream"  // 従来のストリーミングログ
}
```

TUIは並列タスクでより良いUXを提供する。

## remoteCache

リモートキャッシュの設定。

```json
{
  "remoteCache": {
    "enabled": true,
    "signature": true,
    "timeout": 30,
    "uploadTimeout": 60
  }
}
```

| オプション      | デフォルト             | 説明                                                       |
| --------------- | ---------------------- | ---------------------------------------------------------- |
| `enabled`       | `true`                 | リモートキャッシュの有効/無効                               |
| `signature`     | `false`                | `TURBO_REMOTE_CACHE_SIGNATURE_KEY` でアーティファクトに署名 |
| `preflight`     | `false`                | キャッシュリクエスト前にOPTIONSリクエストを送信             |
| `timeout`       | `30`                   | キャッシュ操作のタイムアウト（秒）                         |
| `uploadTimeout` | `60`                   | アップロードのタイムアウト（秒）                           |
| `apiUrl`        | `"https://vercel.com"` | リモートキャッシュAPIエンドポイント                         |
| `loginUrl`      | `"https://vercel.com"` | ログインエンドポイント                                     |
| `teamId`        | -                      | チームID（`team_` で始まる必要あり）                       |
| `teamSlug`      | -                      | クエリ文字列用のチームスラッグ                             |

セットアップについては https://turborepo.dev/docs/core-concepts/remote-caching を参照。

## concurrency

デフォルト: `"10"`

並列タスク実行数を制限する。

```json
{
  "concurrency": "4"     // 最大4タスクを同時実行
  // または
  "concurrency": "50%"   // 利用可能なCPUの50%
}
```

## futureFlags

将来のバージョンでデフォルトになる実験的機能を有効にする。

```json
{
  "futureFlags": {
    "errorsOnlyShowHash": true
  }
}
```

### `errorsOnlyShowHash`

`outputLogs: "errors-only"` 使用時に、タスクの開始/完了時にハッシュを表示する：

- キャッシュミス: `cache miss, executing <hash> (only logging errors)`
- キャッシュヒット: `cache hit, replaying logs (no errors) <hash>`

## noUpdateNotifier

新しいturboバージョンが利用可能な場合の更新通知を無効にする。

```json
{
  "noUpdateNotifier": true
}
```

## dangerouslyDisablePackageManagerCheck

`packageManager` フィールドの要件チェックをバイパスする。段階的な移行に使用する。

```json
{
  "dangerouslyDisablePackageManagerCheck": true
}
```

**警告**: 不安定なロックファイルは予測不能な動作を引き起こす可能性がある。

## Git Worktreeキャッシュ共有

Gitワークツリーで作業する場合、Turborepoはメインワークツリーとリンクされたワークツリー間でローカルキャッシュを自動的に共有する。

**動作の仕組み：**

- ワークツリー設定を検出
- キャッシュをメインワークツリーの `.turbo/cache` にリダイレクト
- リモートキャッシュと併用可能

**メリット：**

- ブランチ間でのキャッシュヒット
- ディスク使用量の削減
- ブランチ切り替えの高速化

**無効化する方法**: turbo.jsonで明示的に `cacheDir` を設定する。
