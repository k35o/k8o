# 設定でよくあるミス

よくある間違いとその修正方法。

## #1 ルートスクリプトで `turbo run` を使っていない

ルート `package.json` のturboタスク用スクリプトは、直接コマンドではなく必ず `turbo run` を使用しなければならない。

```json
// 間違い - turboをバイパスし、並列化やキャッシュが効かない
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

**なぜ重要か:** ルートで `bun build` や `npm run build` を実行するとTurborepoが完全にバイパスされ、並列化もキャッシュも依存関係グラフの認識もなくなる。

## #2 `&&` でTurboタスクをチェーンしている

turboがオーケストレーションすべきタスクに `&&` を使ってはいけない。

```json
// 間違い - changeset:publishがturboタスクとturbo以外のコマンドをチェーンしている
{
  "scripts": {
    "changeset:publish": "bun build && changeset publish"
  }
}

// 正しい - turbo runを使い、依存関係の処理をturboに任せる
{
  "scripts": {
    "changeset:publish": "turbo run build && changeset publish"
  }
}
```

2番目のコマンド（`changeset publish`）がビルド出力に依存する場合、turboタスクはturbo経由で実行し、キャッシュと並列化の恩恵を受けるべきである。

## #3 globalDependenciesが広すぎる

`globalDependencies` はすべてのパッケージのすべてのタスクのハッシュに影響する。具体的に指定すること。

```json
// 間違い - すべてのハッシュに影響する
{
  "globalDependencies": ["**/.env.*local"]
}

// 正しい - 必要な特定のタスクに移動する
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

**なぜ重要か:** `**/.env.*local` はすべてのパッケージの.envファイルにマッチし、不要なキャッシュ無効化を引き起こす。代わりに：

- `globalDependencies` は本当にグローバルなファイル（ルートの `.env`）にのみ使用する
- パッケージ固有の.envファイルにはタスクレベルの `inputs` で `$TURBO_DEFAULT$` と組み合わせてデフォルトの動作を維持する

## #4 タスク設定の繰り返し

タスク間で繰り返される設定を統合できないか探すこと。

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
    }
  }
}

// 改善 - globalEnvとglobalDependenciesを使用
{
  "globalEnv": ["API_URL", "DATABASE_URL"],
  "globalDependencies": [".env*"],
  "tasks": {
    "build": {},
    "test": {}
  }
}
```

**グローバルとタスクレベルの使い分け：**

- `globalEnv` / `globalDependencies` - すべてのタスクに影響する。本当に共有される設定に使用
- タスクレベルの `env` / `inputs` - 特定のタスクのみが必要とする場合に使用

## #5 `inputs` でパッケージ外に `../` で遡っている

パッケージ外のファイルを参照するために `../` のような相対パスを使わないこと。代わりに `$TURBO_ROOT$` を使用する。

```json
// 間違い - パッケージ外に遡っている
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

## #6 最もよくあるミス: ルートタスクの作成

**ルートタスクを作成してはいけない。常にパッケージタスクを作成すること。**

タスク（build、lint、test、typecheckなど）を作成する必要がある場合：

1. **各関連パッケージの** `package.json` にスクリプトを追加する
2. ルートの `turbo.json` にタスクを登録する
3. ルートの `package.json` には `turbo run <task>` のみを記述する

```json
// 間違い - これをやってはいけない
// タスクロジックを持つルートのpackage.json
{
  "scripts": {
    "build": "cd apps/web && next build && cd ../api && tsc",
    "lint": "eslint apps/ packages/",
    "test": "vitest"
  }
}

// 正しい - こうする
// apps/web/package.json
{ "scripts": { "build": "next build", "lint": "eslint .", "test": "vitest" } }

// apps/api/package.json
{ "scripts": { "build": "tsc", "lint": "eslint .", "test": "vitest" } }

// packages/ui/package.json
{ "scripts": { "build": "tsc", "lint": "eslint .", "test": "vitest" } }

// ルートのpackage.json - 委譲のみ
{ "scripts": { "build": "turbo run build", "lint": "turbo run lint", "test": "turbo run test" } }

// turbo.json - タスクを登録
{
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "lint": {},
    "test": {}
  }
}
```

**なぜ重要か：**

- パッケージタスクはすべてのパッケージで**並列**に実行される
- 各パッケージの出力は**個別に**キャッシュされる
- 特定のパッケージに**フィルタリング**できる: `turbo run test --filter=web`

ルートタスク（`//#taskname`）はこれらすべてのメリットを無効にする。どのパッケージにも存在し得ないタスク（極めてまれ）にのみ使用する。

## #7 並列実行 + キャッシュ無効化が必要なタスク

一部のタスクは並列実行可能（依存パッケージのビルド出力が不要）だが、依存パッケージのソースコード変更時にキャッシュを無効化する必要がある。`dependsOn: ["^taskname"]` を使うと逐次実行が強制される。依存関係なしではキャッシュの無効化が壊れる。

**これらのタスクにはトランジットノードを使用する：**

```json
// 間違い - 逐次実行を強制する（低速）
"my-task": {
  "dependsOn": ["^my-task"]
}

// これも間違い - 依存関係の認識がない（不正なキャッシュ）
"my-task": {}

// 正しい - トランジットノードで並列実行 + 正しいキャッシュを実現
{
  "tasks": {
    "transit": { "dependsOn": ["^transit"] },
    "my-task": { "dependsOn": ["transit"] }
  }
}
```

**トランジットノードが機能する理由：**

- `transit` は実際のスクリプトにマッチせずに依存関係を作成する
- `transit` に依存するタスクは依存関係の認識を得る
- `transit` は即座に完了する（スクリプトなし）ため、タスクは並列実行される
- 依存パッケージのソースコード変更時にキャッシュが正しく無効化される

**このパターンが必要なタスクの見分け方：** 依存パッケージのソースファイルを読むが、ビルド出力は必要としないタスクを探す。

## ファイルを生成するタスクでoutputsが欠落している

**`outputs` の欠落を指摘する前に、タスクが実際に何を生成するか確認すること：**

1. パッケージのスクリプトを読む（例：`"build": "tsc"`、`"test": "vitest"`）
2. ディスクにファイルを書き込むか、標準出力のみかを判断する
3. キャッシュすべきファイルを生成する場合にのみ指摘する

```json
// 間違い - buildがファイルを生成するがキャッシュされない
"build": {
  "dependsOn": ["^build"]
}

// 正しい - outputsがキャッシュされる
"build": {
  "dependsOn": ["^build"],
  "outputs": ["dist/**"]
}
```

標準出力のみのタスクでは `outputs` キーがなくても問題ない。ファイルを生成するタスクで `outputs` がない場合、Turboにはキャッシュするものがない。

## dependsOnの ^ を忘れている

```json
// 間違い - 同じパッケージ内の "build" を探す（無限ループまたは見つからない）
"build": {
  "dependsOn": ["build"]
}

// 正しい - 依存パッケージのbuildを先に実行する
"build": {
  "dependsOn": ["^build"]
}
```

`^` は「依存パッケージ内の」という意味であり、「このパッケージ内の」ではない。

## 開発タスクでpersistentが欠落している

```json
// 間違い - 依存タスクがdevの「完了」を待ち続けてハングする
"dev": {
  "cache": false
}

// 正しい
"dev": {
  "cache": false,
  "persistent": true
}
```

## パッケージ設定でextendsが欠落している

```json
// 間違い - packages/web/turbo.json
{
  "tasks": {
    "build": { "outputs": [".next/**"] }
  }
}

// 正しい
{
  "extends": ["//"],
  "tasks": {
    "build": { "outputs": [".next/**"] }
  }
}
```

`"extends": ["//"]` がないと、パッケージ設定は無効になる。

## ルートタスクには特別な構文が必要

ルートの `package.json` でのみ定義されたタスクを実行するには：

```bash
# 間違い
turbo run format

# 正しい
turbo run //#format
```

dependsOnでも同様：

```json
"build": {
  "dependsOn": ["//#codegen"]  // ルートパッケージのcodegen
}
```

## デフォルトのinputsを上書きしている

```json
// 間違い - テストファイルのみを監視し、ソースの変更を無視する
"test": {
  "inputs": ["tests/**"]
}

// 正しい - デフォルトを拡張し、テストファイルを追加する
"test": {
  "inputs": ["$TURBO_DEFAULT$", "tests/**"]
}
```

`$TURBO_DEFAULT$` がないと、すべてのデフォルトのファイル監視が置き換えられる。

## 副作用のあるタスクをキャッシュしている

```json
// 間違い - キャッシュヒット時にdeployがスキップされる可能性がある
"deploy": {
  "dependsOn": ["build"]
}

// 正しい
"deploy": {
  "dependsOn": ["build"],
  "cache": false
}
```

deploy、publish、またはミューテーションタスクでは常にキャッシュを無効にすること。
