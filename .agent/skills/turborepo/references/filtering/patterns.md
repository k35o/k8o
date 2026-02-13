# よく使うフィルターパターン

典型的なモノレポのシナリオに対する実用的な例。

## 単一パッケージ

1つのパッケージでタスクを実行:

```bash
turbo run build --filter=web
turbo run test --filter=@acme/api
```

## パッケージとその依存元

パッケージと、それが依存するすべてのものをビルド:

```bash
turbo run build --filter=web...
```

ユースケース: ターゲットの前にすべての依存元がビルドされていることを確認する。

## パッケージの依存先

あるライブラリに依存するすべてのパッケージで実行:

```bash
turbo run test --filter=...ui
```

ユースケース: 共有パッケージを変更した後、コンシューマーをテストする。

## 依存先のみ（ターゲットを除く）

uiに依存するパッケージをテストするが、ui自体は除く:

```bash
turbo run test --filter=...^ui
```

## 変更されたパッケージ

最後のコミット以降にファイル変更があるパッケージのみで実行:

```bash
turbo run lint --filter=[HEAD^1]
```

特定のブランチポイント以降:

```bash
turbo run lint --filter=[main...HEAD]
```

## 変更 + 依存先（PRビルド）

変更されたパッケージとそれに依存するパッケージで実行:

```bash
turbo run build test --filter=...[HEAD^1]
```

またはショートカットを使用:

```bash
turbo run build test --affected
```

## ディレクトリベース

すべてのappsで実行:

```bash
turbo run build --filter=./apps/*
```

特定のディレクトリで実行:

```bash
turbo run build --filter=./apps/web --filter=./apps/api
```

## スコープベース

あるスコープ配下のすべてのパッケージで実行:

```bash
turbo run build --filter=@acme/*
```

## 除外

admin以外のすべてのappsで実行:

```bash
turbo run build --filter=./apps/* --filter=!admin
```

特定のパッケージを除いてすべてで実行:

```bash
turbo run lint --filter=!legacy-app --filter=!deprecated-pkg
```

## 複雑な組み合わせ

変更されたappsとその依存先:

```bash
turbo run build --filter=...[HEAD^1] --filter=./apps/*
```

docs以外のすべてのパッケージ（変更されたもののみ）:

```bash
turbo run build --filter=[main...HEAD] --filter=!docs
```

## フィルターのデバッグ

`--dry`を使用して、実行せずに何が実行されるかを確認:

```bash
turbo run build --filter=web... --dry
```

`--dry=json`で機械可読な出力を取得:

```bash
turbo run build --filter=...[HEAD^1] --dry=json
```

## CI/CDパターン

PRバリデーション（最も一般的）:

```bash
turbo run build test lint --affected
```

変更されたappsのみデプロイ:

```bash
turbo run deploy --filter=./apps/* --filter=[main...HEAD]
```

特定のアプリとその依存元の完全な再ビルド:

```bash
turbo run build --filter=production-app...
```
