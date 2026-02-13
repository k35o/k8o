---
name: turborepo
description: |
  Turborepoモノレポビルドシステムのガイダンス。turbo.json、タスクパイプライン、
  dependsOn、キャッシュ、リモートキャッシュ、turbo CLI、--filter、--affected、CI最適化、
  環境変数、内部パッケージ、モノレポ構成・ベストプラクティス、バウンダリに対応。

  ユーザーがタスク/ワークフロー/パイプラインの設定、パッケージ作成、モノレポセットアップ、
  アプリ間コード共有、変更パッケージの実行、キャッシュデバッグ、
  apps/packagesディレクトリの操作を行う場合に使用。
metadata:
  version: 2.8.3-canary.14
---

# Turborepoスキル

JavaScript/TypeScriptモノレポ向けのビルドシステム。Turborepoはタスクの出力をキャッシュし、依存関係グラフに基づいてタスクを並列実行します。

## 重要：パッケージタスクを使い、ルートタスクは使わない

**ルートタスクは作成しないでください。必ずパッケージタスクを作成してください。**

タスク/スクリプト/パイプラインを作成する際は、必ず以下を守ってください：

1. 各関連パッケージの `package.json` にスクリプトを追加する
2. ルートの `turbo.json` にタスクを登録する
3. ルートの `package.json` は `turbo run <task>` で委譲するだけにする

**ルートの `package.json` にタスクロジックを記述しないでください。** Turborepoの並列化が無効になります。

```json
// こうする：各パッケージにスクリプトを配置
// apps/web/package.json
{ "scripts": { "build": "next build", "lint": "eslint .", "test": "vitest" } }

// apps/api/package.json
{ "scripts": { "build": "tsc", "lint": "eslint .", "test": "vitest" } }

// packages/ui/package.json
{ "scripts": { "build": "tsc", "lint": "eslint .", "test": "vitest" } }
```

```json
// turbo.json - タスクを登録
{
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "lint": {},
    "test": { "dependsOn": ["build"] }
  }
}
```

```json
// ルート package.json - 委譲のみ、タスクロジックなし
{
  "scripts": {
    "build": "turbo run build",
    "lint": "turbo run lint",
    "test": "turbo run test"
  }
}
```

```json
// こうしてはいけない - 並列化が無効になる
// ルート package.json
{
  "scripts": {
    "build": "cd apps/web && next build && cd ../api && tsc",
    "lint": "eslint apps/ packages/",
    "test": "vitest"
  }
}
```

ルートタスク（`//#taskname`）は、パッケージ内に配置できないタスクにのみ使用してください（まれなケース）。

## 補助ルール：`turbo run` と `turbo`

**コードに記述する場合は常に `turbo run` を使用してください：**

```json
// package.json - 常に "turbo run"
{
  "scripts": {
    "build": "turbo run build"
  }
}
```

```yaml
# CIワークフロー - 常に "turbo run"
- run: turbo run build --affected
```

**省略形の `turbo <tasks>` は、人間やエージェントがターミナルで直接入力する一回限りのコマンドにのみ使用してください。** `turbo build` を package.json、CI、またはスクリプトに書かないでください。

## クイック判断ツリー

### 「タスクを設定したい」

```
タスクを設定する？
├─ タスクの依存関係を定義 → references/configuration/tasks.md
├─ lint/check-types（並列＋キャッシュ） → トランジットノードパターンを使用（下記参照）
├─ ビルド出力を指定 → references/configuration/tasks.md#outputs
├─ 環境変数を扱う → references/environment/RULE.md
├─ dev/watchタスクの設定 → references/configuration/tasks.md#persistent
├─ パッケージ固有の設定 → references/configuration/RULE.md#package-configurations
└─ グローバル設定（cacheDir、daemon） → references/configuration/global-options.md
```

### 「キャッシュが動かない」

```
キャッシュの問題？
├─ タスクは実行されるが出力が復元されない → `outputs` キーが未設定
├─ 予期せずキャッシュミスが発生する → references/caching/gotchas.md
├─ ハッシュ入力をデバッグしたい → --summarize または --dry を使用
├─ キャッシュを完全にスキップしたい → --force または cache: false を使用
├─ リモートキャッシュが動作しない → references/caching/remote-cache.md
└─ 環境がキャッシュミスの原因 → references/environment/gotchas.md
```

### 「変更されたパッケージだけ実行したい」

```
変更分だけ実行する？
├─ 変更パッケージ＋依存先（推奨） → turbo run build --affected
├─ カスタムベースブランチ → --affected --affected-base=origin/develop
├─ 手動git比較 → --filter=...[origin/main]
└─ すべてのフィルターオプションを確認 → references/filtering/RULE.md
```

**`--affected` は変更パッケージのみ実行する主要な方法です。** デフォルトブランチと自動的に比較し、依存先も含めます。

### 「パッケージをフィルタリングしたい」

```
パッケージのフィルタリング？
├─ 変更パッケージのみ → --affected（上記参照）
├─ パッケージ名で指定 → --filter=web
├─ ディレクトリで指定 → --filter=./apps/*
├─ パッケージ＋依存関係 → --filter=web...
├─ パッケージ＋依存先 → --filter=...web
└─ 複雑な組み合わせ → references/filtering/patterns.md
```

### 「環境変数が動作しない」

```
環境変数の問題？
├─ 実行時に変数が利用できない → Strictモードフィルタリング（デフォルト）
├─ 間違ったenvでキャッシュヒットする → 変数が `env` キーに未設定
├─ .envの変更でリビルドされない → .env が `inputs` に未設定
├─ CI変数が見つからない → references/environment/gotchas.md
└─ フレームワーク変数（NEXT_PUBLIC_*） → 推論による自動インクルード
```

### 「CIをセットアップしたい」

```
CIのセットアップ？
├─ GitHub Actions → references/ci/github-actions.md
├─ Vercelデプロイ → references/ci/vercel.md
├─ CIでリモートキャッシュ → references/caching/remote-cache.md
├─ 変更パッケージのみビルド → --affected フラグ
├─ 不要なビルドをスキップ → turbo-ignore (references/cli/commands.md)
└─ 変更なし時にコンテナセットアップをスキップ → turbo-ignore
```

### 「開発中にファイル変更を監視したい」

```
ウォッチモード？
├─ 変更時にタスクを再実行 → turbo watch (references/watch/RULE.md)
├─ 依存関係のあるdevサーバー → `with` キーを使用 (references/configuration/tasks.md#with)
├─ 依存パッケージ変更時にdevサーバーを再起動 → `interruptible: true` を使用
└─ 永続的なdevタスク → `persistent: true` を使用
```

### 「パッケージを作成・構成したい」

```
パッケージの作成・構成？
├─ 内部パッケージを作成 → references/best-practices/packages.md
├─ リポジトリ構成 → references/best-practices/structure.md
├─ 依存関係管理 → references/best-practices/dependencies.md
├─ ベストプラクティス概要 → references/best-practices/RULE.md
├─ JIT vs コンパイル済みパッケージ → references/best-practices/packages.md#compilation-strategies
└─ アプリ間のコード共有 → references/best-practices/RULE.md#package-types
```

### 「モノレポをどう構成すべきか？」

```
モノレポの構成？
├─ 標準レイアウト（apps/, packages/） → references/best-practices/RULE.md
├─ パッケージタイプ（アプリ vs ライブラリ） → references/best-practices/RULE.md#package-types
├─ 内部パッケージの作成 → references/best-practices/packages.md
├─ TypeScript設定 → references/best-practices/structure.md#typescript-configuration
├─ ESLint設定 → references/best-practices/structure.md#eslint-configuration
├─ 依存関係管理 → references/best-practices/dependencies.md
└─ パッケージ境界の強制 → references/boundaries/RULE.md
```

### 「アーキテクチャ境界を強制したい」

```
境界を強制する？
├─ 違反をチェック → turbo boundaries
├─ パッケージにタグ付け → references/boundaries/RULE.md#tags
├─ パッケージ間のインポートを制限 → references/boundaries/RULE.md#rule-types
└─ パッケージ間のファイルインポートを防止 → references/boundaries/RULE.md
```

## 重大なアンチパターン

### コード内での `turbo` 省略形の使用

**`turbo run` は package.json スクリプトおよびCIパイプラインで推奨されます。** 省略形の `turbo <task>` は対話的なターミナル使用を想定しています。

```json
// 間違い - package.jsonで省略形を使用
{
  "scripts": {
    "build": "turbo build",
    "dev": "turbo dev"
  }
}

// 正しい
{
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev"
  }
}
```

```yaml
# 間違い - CIで省略形を使用
- run: turbo build --affected

# 正しい
- run: turbo run build --affected
```

### ルートスクリプトがTurboをバイパスしている

ルート `package.json` のスクリプトは `turbo run` に委譲しなければならず、タスクを直接実行してはいけません。

```json
// 間違い - turboを完全にバイパスしている
{
  "scripts": {
    "build": "bun build",
    "dev": "bun dev"
  }
}

// 正しい - turboに委譲
{
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev"
  }
}
```

### `&&` でTurboタスクをチェーンしている

turboタスクを `&&` でチェーンしないでください。turboにオーケストレーションを任せてください。

```json
// 間違い - turboタスクが turbo run を使っていない
{
  "scripts": {
    "changeset:publish": "bun build && changeset publish"
  }
}

// 正しい
{
  "scripts": {
    "changeset:publish": "turbo run build && changeset publish"
  }
}
```

### 依存パッケージを手動ビルドする `prebuild` スクリプト

他のパッケージを手動でビルドする `prebuild` のようなスクリプトは、Turborepoの依存関係グラフをバイパスします。

```json
// 間違い - 手動で依存パッケージをビルド
{
  "scripts": {
    "prebuild": "cd ../../packages/types && bun run build && cd ../utils && bun run build",
    "build": "next build"
  }
}
```

**ただし、修正方法はワークスペース依存関係が宣言されているかどうかによって異なります：**

1. **依存関係が宣言されている場合**（例：package.jsonに `"@repo/types": "workspace:*"` がある）、`prebuild` スクリプトを削除してください。Turboの `dependsOn: ["^build"]` が自動的に処理します。

2. **依存関係が宣言されていない場合**、依存関係なしでは `^build` がトリガーされないため、`prebuild` が存在しています。修正方法：
   - package.jsonに依存関係を追加する：`"@repo/types": "workspace:*"`
   - その後 `prebuild` スクリプトを削除する

```json
// 正しい - 依存関係を宣言し、turboにビルド順序を任せる
// package.json
{
  "dependencies": {
    "@repo/types": "workspace:*",
    "@repo/utils": "workspace:*"
  },
  "scripts": {
    "build": "next build"
  }
}

// turbo.json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"]
    }
  }
}
```

**重要なポイント：** `^build` は依存関係として宣言されたパッケージでのみビルドを実行します。依存関係の宣言がなければ、自動的なビルド順序の制御は行われません。

### 過度に広範な `globalDependencies`

`globalDependencies` はすべてのパッケージのすべてのタスクに影響します。具体的に指定してください。

```json
// 間違い - 大雑把で、すべてのハッシュに影響
{
  "globalDependencies": ["**/.env.*local"]
}

// より良い - タスクレベルのinputsに移動
{
  "globalDependencies": [".env"],
  "tasks": {
    "build": {
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": ["dist/**"]
    }
  }
}
```

### 繰り返しのタスク設定

タスク間で繰り返される設定を統合できないか確認してください。Turborepoは共有設定パターンをサポートしています。

```json
// 間違い - タスク間でenvとinputsが繰り返されている
{
  "tasks": {
    "build": {
      "env": ["API_URL", "DATABASE_URL"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"]
    },
    "test": {
      "env": ["API_URL", "DATABASE_URL"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"]
    },
    "dev": {
      "env": ["API_URL", "DATABASE_URL"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "cache": false,
      "persistent": true
    }
  }
}

// より良い - 共有設定にglobalEnvとglobalDependenciesを使用
{
  "globalEnv": ["API_URL", "DATABASE_URL"],
  "globalDependencies": [".env*"],
  "tasks": {
    "build": {},
    "test": {},
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

**グローバルとタスクレベルの使い分け：**

- `globalEnv` / `globalDependencies` - すべてのタスクに影響、本当に共有する設定に使用
- タスクレベルの `env` / `inputs` - 特定のタスクだけに必要な場合に使用

### アンチパターンではない：大きな `env` 配列

大きな `env` 配列（50以上の変数でも）は**問題ではありません**。通常、ユーザーがビルドの環境依存関係を丁寧に宣言したことを意味します。これを問題として指摘しないでください。

### `--parallel` フラグの使用

`--parallel` フラグはTurborepoの依存関係グラフをバイパスします。タスクの並列実行が必要な場合は、代わりに `dependsOn` を正しく設定してください。

```bash
# 間違い - 依存関係グラフをバイパス
turbo run lint --parallel

# 正しい - 並列実行を許可するようタスクを設定
# turbo.jsonでdependsOnを適切に設定する（またはトランジットノードを使用）
turbo run lint
```

### ルート turbo.json でのパッケージ固有タスクオーバーライド

複数のパッケージで異なるタスク設定が必要な場合、ルート `turbo.json` を `package#task` オーバーライドで散らかすのではなく、**パッケージ設定**（各パッケージ内の `turbo.json`）を使用してください。

```json
// 間違い - ルート turbo.json にパッケージ固有のオーバーライドが多数
{
  "tasks": {
    "test": { "dependsOn": ["build"] },
    "@repo/web#test": { "outputs": ["coverage/**"] },
    "@repo/api#test": { "outputs": ["coverage/**"] },
    "@repo/utils#test": { "outputs": [] },
    "@repo/cli#test": { "outputs": [] },
    "@repo/core#test": { "outputs": [] }
  }
}

// 正しい - パッケージ設定を使用
// ルート turbo.json - ベース設定のみ
{
  "tasks": {
    "test": { "dependsOn": ["build"] }
  }
}

// packages/web/turbo.json - パッケージ固有のオーバーライド
{
  "extends": ["//"],
  "tasks": {
    "test": { "outputs": ["coverage/**"] }
  }
}

// packages/api/turbo.json
{
  "extends": ["//"],
  "tasks": {
    "test": { "outputs": ["coverage/**"] }
  }
}
```

**パッケージ設定の利点：**

- 設定がそれに関連するコードの近くに配置される
- ルート turbo.json がクリーンでベースパターンに集中できる
- 各パッケージの特別な点が理解しやすくなる
- `$TURBO_EXTENDS$` で配列の継承・拡張が可能

**ルートで `package#task` を使うべき場合：**

- 単一パッケージにユニークな依存関係が必要な場合（例：`"deploy": { "dependsOn": ["web#build"] }`）
- マイグレーション中の一時的なオーバーライド

詳細は `references/configuration/RULE.md#package-configurations` を参照してください。

### `inputs` でパッケージ外を `../` で参照する

パッケージ外のファイルを参照するために `../` のような相対パスを使わないでください。代わりに `$TURBO_ROOT$` を使用してください。

```json
// 間違い - パッケージ外を参照
{
  "tasks": {
    "build": {
      "inputs": ["$TURBO_DEFAULT$", "../shared-config.json"]
    }
  }
}

// 正しい - リポジトリルートには $TURBO_ROOT$ を使用
{
  "tasks": {
    "build": {
      "inputs": ["$TURBO_DEFAULT$", "$TURBO_ROOT$/shared-config.json"]
    }
  }
}
```

### ファイル生成タスクで `outputs` が未設定

**`outputs` の欠如を指摘する前に、タスクが実際に何を生成するか確認してください：**

1. パッケージのスクリプトを読む（例：`"build": "tsc"`、`"test": "vitest"`）
2. ディスクにファイルを書き込むのか、stdoutに出力するだけなのかを判断する
3. キャッシュすべきファイルを生成するタスクの場合のみ指摘する

```json
// 間違い：ビルドはファイルを生成するがキャッシュされない
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"]
    }
  }
}

// 正しい：ビルド出力がキャッシュされる
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    }
  }
}
```

フレームワーク別の一般的な出力：

- Next.js: `[".next/**", "!.next/cache/**"]`
- Vite/Rollup: `["dist/**"]`
- tsc: `["dist/**"]` またはカスタム `outDir`

**TypeScript `--noEmit` でもキャッシュファイルが生成される場合がある：**

tsconfig.json で `incremental: true` が設定されている場合、`tsc --noEmit` はJSを出力しなくても `.tsbuildinfo` ファイルを書き込みます。出力がないと仮定する前にtsconfigを確認してください：

```json
// tsconfigに incremental: true がある場合、tsc --noEmit はキャッシュファイルを生成する
{
  "tasks": {
    "typecheck": {
      "outputs": ["node_modules/.cache/tsbuildinfo.json"] // または tsBuildInfoFile が指す場所
    }
  }
}
```

TypeScriptタスクの正しい出力を判断するには：

1. tsconfigで `incremental` または `composite` が有効か確認する
2. `tsBuildInfoFile` でカスタムキャッシュ場所を確認する（デフォルト：`outDir` の横またはプロジェクトルート）
3. インクリメンタルモードでない場合、`tsc --noEmit` はファイルを生成しない

### `^build` と `build` の混同

```json
{
  "tasks": {
    // ^build = 依存パッケージ（このパッケージがインポートする他のパッケージ）で先にビルドを実行
    "build": {
      "dependsOn": ["^build"]
    },
    // build（^なし） = 同じパッケージ内で先にビルドを実行
    "test": {
      "dependsOn": ["build"]
    },
    // pkg#task = 特定パッケージのタスク
    "deploy": {
      "dependsOn": ["web#build"]
    }
  }
}
```

### 環境変数がハッシュされていない

```json
// 間違い：API_URLの変更でリビルドされない
{
  "tasks": {
    "build": {
      "outputs": ["dist/**"]
    }
  }
}

// 正しい：API_URLの変更でキャッシュが無効化される
{
  "tasks": {
    "build": {
      "outputs": ["dist/**"],
      "env": ["API_URL", "API_KEY"]
    }
  }
}
```

### `.env` ファイルが inputs に含まれていない

Turboは `.env` ファイルを読み込みません（フレームワークが読み込みます）。しかしTurboは変更を検知する必要があります：

```json
// 間違い：.envの変更でキャッシュが無効化されない
{
  "tasks": {
    "build": {
      "env": ["API_URL"]
    }
  }
}

// 正しい：.envファイルの変更でキャッシュが無効化される
{
  "tasks": {
    "build": {
      "env": ["API_URL"],
      "inputs": ["$TURBO_DEFAULT$", ".env", ".env.*"]
    }
  }
}
```

### モノレポのルートにある `.env` ファイル

リポジトリルートの `.env` ファイルはアンチパターンです。小規模なモノレポやスターターテンプレートであってもです。パッケージ間の暗黙的な結合を生み出し、どのパッケージがどの変数に依存しているかが不明確になります。

```
// 間違い - ルートの.envがすべてのパッケージに暗黙的に影響
my-monorepo/
├── .env              # どのパッケージがこれを使う？
├── apps/
│   ├── web/
│   └── api/
└── packages/

// 正しい - 必要なパッケージに.envファイルを配置
my-monorepo/
├── apps/
│   ├── web/
│   │   └── .env      # 明確：webがDATABASE_URLを必要とする
│   └── api/
│       └── .env      # 明確：apiがAPI_KEYを必要とする
└── packages/
```

**ルート `.env` の問題点：**

- どのパッケージがどの変数を使用するかが不明確
- すべてのパッケージがすべての変数を取得する（不要なものも含めて）
- キャッシュ無効化が粗粒度になる（ルートの.env変更ですべてが無効化される）
- セキュリティリスク：パッケージが他のパッケージ向けの機密変数に誤ってアクセスする可能性がある
- 悪い習慣は小さなところから始まる — スターターテンプレートは正しいパターンを示すべき

**変数を共有する必要がある場合は**、`globalEnv` を使って共有内容を明示し、その理由を文書化してください。

### StrictモードによるCI変数のフィルタリング

デフォルトでは、Turborepoは環境変数を `env`/`globalEnv` に記載されたものだけにフィルタリングします。CI変数が不足する場合があります：

```json
// CIスクリプトがGITHUB_TOKENを必要とするがenvに含まれていない場合：
{
  "globalPassThroughEnv": ["GITHUB_TOKEN", "CI"],
  "tasks": { ... }
}
```

または `--env-mode=loose` を使用してください（本番環境では非推奨）。

### アプリ内の共有コード（パッケージにすべき）

```
// 間違い：アプリ内に共有コードがある
apps/
  web/
    shared/          # モノレポの原則に反する！
      utils.ts

// 正しい：パッケージに抽出
packages/
  utils/
    src/utils.ts
```

### パッケージ境界を越えたファイルアクセス

```typescript
// 間違い：他のパッケージの内部に直接アクセス
import { Button } from "../../packages/ui/src/button";

// 正しい：インストールして適切にインポート
import { Button } from "@repo/ui/button";
```

### ルートの依存関係が多すぎる

```json
// 間違い：アプリの依存関係がルートにある
{
  "dependencies": {
    "react": "^18",
    "next": "^14"
  }
}

// 正しい：ルートにはリポジトリツールのみ
{
  "devDependencies": {
    "turbo": "latest"
  }
}
```

## 一般的なタスク設定

### 標準ビルドパイプライン

```json
{
  "$schema": "https://turborepo.dev/schema.v2.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

キャッシュ無効化を伴う並列実行が必要なタスクがある場合は、`transit` タスクを追加してください（下記参照）。

### `^dev` パターンを使用したdevタスク（`turbo watch` 用）

ルート turbo.json で `dependsOn: ["^dev"]` と `persistent: false` を持つ `dev` タスクは一見奇妙に見えますが、**`turbo watch` ワークフローでは正しい構成です**：

```json
// ルート turbo.json
{
  "tasks": {
    "dev": {
      "dependsOn": ["^dev"],
      "cache": false,
      "persistent": false  // パッケージはワンショットのdevスクリプトを持つ
    }
  }
}

// パッケージ turbo.json (apps/web/turbo.json)
{
  "extends": ["//"],
  "tasks": {
    "dev": {
      "persistent": true  // アプリは長時間実行のdevサーバーを実行
    }
  }
}
```

**なぜこれが動作するか：**

- **パッケージ**（例：`@acme/db`、`@acme/validators`）は `"dev": "tsc"` を持つ — すぐに完了するワンショットの型生成
- **アプリ**は実際のdevサーバー（Next.jsなど）のために `persistent: true` でオーバーライド
- **`turbo watch`** はソースファイルが変更されたときにワンショットのパッケージ `dev` スクリプトを再実行し、型を同期させる

**想定される使い方：** `turbo watch dev`（`turbo run dev` ではなく）を実行します。ウォッチモードはファイル変更時にワンショットタスクを再実行し、永続タスクは実行し続けます。

**代替パターン：** 意図をより明確にするために、ワンショットの依存関係ビルドには `prepare` や `generate` のような別のタスク名を使用してください：

```json
{
  "tasks": {
    "prepare": {
      "dependsOn": ["^prepare"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "dependsOn": ["prepare"],
      "cache": false,
      "persistent": true
    }
  }
}
```

### キャッシュ無効化を伴う並列タスクのためのトランジットノード

一部のタスクは並列実行可能（依存パッケージのビルド出力を必要としない）ですが、依存パッケージのソースコードが変更された場合にキャッシュを無効化する必要があります。

**`dependsOn: ["^taskname"]` の問題：**

- 逐次実行を強制する（遅い）

**`dependsOn: []`（依存関係なし）の問題：**

- 並列実行が可能（速い）
- しかしキャッシュが不正確 — 依存パッケージのソース変更でキャッシュが無効化されない

**トランジットノードが両方を解決します：**

```json
{
  "tasks": {
    "transit": { "dependsOn": ["^transit"] },
    "my-task": { "dependsOn": ["transit"] }
  }
}
```

`transit` タスクは実際のスクリプトにマッチせずに依存関係を作成するため、正しいキャッシュ無効化で並列実行が可能になります。

**このパターンが必要なタスクの見分け方：** 依存パッケージのソースファイルを読み込むが、ビルド出力は必要としないタスクを探してください。

### 環境変数あり

```json
{
  "globalEnv": ["NODE_ENV"],
  "globalDependencies": [".env"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"],
      "env": ["API_URL", "DATABASE_URL"]
    }
  }
}
```

## リファレンスインデックス

### 設定

| ファイル                                                                        | 用途                                                     |
| ------------------------------------------------------------------------------- | -------------------------------------------------------- |
| [configuration/RULE.md](./references/configuration/RULE.md)                     | turbo.json概要、パッケージ設定                           |
| [configuration/tasks.md](./references/configuration/tasks.md)                   | dependsOn, outputs, inputs, env, cache, persistent       |
| [configuration/global-options.md](./references/configuration/global-options.md) | globalEnv, globalDependencies, cacheDir, daemon, envMode |
| [configuration/gotchas.md](./references/configuration/gotchas.md)               | よくある設定ミス                                         |

### キャッシュ

| ファイル                                                        | 用途                                         |
| --------------------------------------------------------------- | -------------------------------------------- |
| [caching/RULE.md](./references/caching/RULE.md)                 | キャッシュの仕組み、ハッシュ入力             |
| [caching/remote-cache.md](./references/caching/remote-cache.md) | Vercelリモートキャッシュ、セルフホスト、login/link |
| [caching/gotchas.md](./references/caching/gotchas.md)           | キャッシュミスのデバッグ、--summarize、--dry  |

### 環境変数

| ファイル                                                      | 用途                                      |
| ------------------------------------------------------------- | ----------------------------------------- |
| [environment/RULE.md](./references/environment/RULE.md)       | env, globalEnv, passThroughEnv            |
| [environment/modes.md](./references/environment/modes.md)     | Strict vs Looseモード、フレームワーク推論 |
| [environment/gotchas.md](./references/environment/gotchas.md) | .envファイル、CIの問題                    |

### フィルタリング

| ファイル                                                    | 用途                     |
| ----------------------------------------------------------- | ------------------------ |
| [filtering/RULE.md](./references/filtering/RULE.md)         | --filter構文の概要       |
| [filtering/patterns.md](./references/filtering/patterns.md) | 一般的なフィルターパターン |

### CI/CD

| ファイル                                                  | 用途                            |
| --------------------------------------------------------- | ------------------------------- |
| [ci/RULE.md](./references/ci/RULE.md)                     | 一般的なCIの原則                |
| [ci/github-actions.md](./references/ci/github-actions.md) | GitHub Actionsの完全なセットアップ |
| [ci/vercel.md](./references/ci/vercel.md)                 | Vercelデプロイ、turbo-ignore    |
| [ci/patterns.md](./references/ci/patterns.md)             | --affected、キャッシュ戦略      |

### CLI

| ファイル                                        | 用途                                          |
| ----------------------------------------------- | --------------------------------------------- |
| [cli/RULE.md](./references/cli/RULE.md)         | turbo runの基本                               |
| [cli/commands.md](./references/cli/commands.md) | turbo runのフラグ、turbo-ignore、その他コマンド |

### ベストプラクティス

| ファイル                                                                      | 用途                                                        |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------- |
| [best-practices/RULE.md](./references/best-practices/RULE.md)                 | モノレポベストプラクティスの概要                              |
| [best-practices/structure.md](./references/best-practices/structure.md)       | リポジトリ構成、ワークスペース設定、TypeScript/ESLintセットアップ |
| [best-practices/packages.md](./references/best-practices/packages.md)         | 内部パッケージの作成、JIT vs コンパイル済み、exports          |
| [best-practices/dependencies.md](./references/best-practices/dependencies.md) | 依存関係管理、インストール、バージョン同期                    |

### ウォッチモード

| ファイル                                    | 用途                                            |
| ------------------------------------------- | ----------------------------------------------- |
| [watch/RULE.md](./references/watch/RULE.md) | turbo watch、中断可能タスク、devワークフロー    |

### バウンダリ（実験的）

| ファイル                                              | 用途                                                  |
| ----------------------------------------------------- | ----------------------------------------------------- |
| [boundaries/RULE.md](./references/boundaries/RULE.md) | パッケージ分離の強制、タグベースの依存関係ルール       |

## ソースドキュメント

このスキルはTurborepoの公式ドキュメントに基づいています：

- ソース: Turborepoリポジトリの `apps/docs/content/docs/`
- 公開サイト: https://turborepo.dev/docs
