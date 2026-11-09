# 環境モード

Turborepoはタスク実行時の環境変数の扱いについて、異なるモードをサポートしています。

## Strictモード（デフォルト）

明示的に設定された変数のみがタスクで利用可能になります。

**動作:**

- タスクは`env`、`globalEnv`、`passThroughEnv`、または`globalPassThroughEnv`にリストされた変数のみ参照できる
- リストにない変数はフィルタリングされる
- リストにない変数を必要とするタスクは失敗する

**メリット:**

- キャッシュの正確性を保証する
- システム変数への意図しない依存を防ぐ
- マシン間で再現可能なビルドを実現する

```bash
# 明示的な指定（デフォルトなので通常は不要）
turbo run build --env-mode=strict
```

## Looseモード

すべてのシステム環境変数がタスクで利用可能になります。

```bash
turbo run build --env-mode=loose
```

**動作:**

- すべてのシステム環境変数がパススルーされる
- `env`/`globalEnv`内の変数のみがハッシュに影響する
- その他の変数は利用可能だがハッシュには含まれない

**リスク:**

- ハッシュに含まれない変数が変更された場合、キャッシュが不正な結果を返す可能性がある
- 「自分のマシンでは動く」問題
- CIとローカル環境の不一致

**ユースケース:** レガシープロジェクトの移行やStrictモードの問題のデバッグ。

## フレームワーク推論（自動）

Turborepoはフレームワークを自動検出し、その慣例的な環境変数を含めます。

### フレームワークごとの推論される変数

| フレームワーク   | パターン            |
| ---------------- | ------------------- |
| Next.js          | `NEXT_PUBLIC_*`     |
| Vite             | `VITE_*`            |
| Create React App | `REACT_APP_*`       |
| Gatsby           | `GATSBY_*`          |
| Nuxt             | `NUXT_*`, `NITRO_*` |
| Expo             | `EXPO_PUBLIC_*`     |
| Astro            | `PUBLIC_*`          |
| SvelteKit        | `PUBLIC_*`          |
| Remix            | `REMIX_*`           |
| Redwood          | `REDWOOD_ENV_*`     |
| Sanity           | `SANITY_STUDIO_*`   |
| Solid            | `VITE_*`            |

### フレームワーク推論を無効化する

CLIでグローバルに無効化:

```bash
turbo run build --framework-inference=false
```

または設定で特定のパターンを除外:

```json
{
  "tasks": {
    "build": {
      "env": ["!NEXT_PUBLIC_*"]
    }
  }
}
```

### なぜ無効化するのか?

- すべての環境変数を明示的に制御したい場合
- フレームワーク変数でキャッシュを無効化したくない場合（例: アナリティクスID）
- 予期しないキャッシュミスのデバッグ

## 環境モードの確認

`--dry`を使用して、各タスクに影響する変数を確認できます:

```bash
turbo run build --dry=json | jq '.tasks[].environmentVariables'
```
