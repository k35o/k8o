# Boundaries

**実験的機能** - [RFC](https://github.com/vercel/turborepo/discussions/9435) を参照

完全なドキュメント: https://turborepo.dev/docs/reference/boundaries

Boundariesは以下を検出することでパッケージの分離を強制します:

1. パッケージのディレクトリ外のファイルのインポート
2. `package.json` の dependencies に宣言されていないパッケージのインポート

## 使い方

```bash
turbo boundaries
```

モノレポ全体のワークスペース違反をチェックするために実行します。

## タグ

タグを使うことで、どのパッケージが互いに依存できるかのルールを作成できます。

### パッケージにタグを追加する

```json
// packages/ui/turbo.json
{
  "tags": ["internal"]
}
```

### タグルールの設定

ルールはルートの `turbo.json` に記述します:

```json
// turbo.json
{
  "boundaries": {
    "tags": {
      "public": {
        "dependencies": {
          "deny": ["internal"]
        }
      }
    }
  }
}
```

これにより、`public` タグが付いたパッケージが `internal` タグが付いたパッケージをインポートすることを防ぎます。

### ルールの種類

**許可リスト方式**（特定のタグのみ許可）:

```json
{
  "boundaries": {
    "tags": {
      "public": {
        "dependencies": {
          "allow": ["public"]
        }
      }
    }
  }
}
```

**拒否リスト方式**（特定のタグをブロック）:

```json
{
  "boundaries": {
    "tags": {
      "public": {
        "dependencies": {
          "deny": ["internal"]
        }
      }
    }
  }
}
```

**依存元の制限**（このパッケージをインポートできるパッケージを制限）:

```json
{
  "boundaries": {
    "tags": {
      "private": {
        "dependents": {
          "deny": ["public"]
        }
      }
    }
  }
}
```

### パッケージ名の使用

タグの代わりにパッケージ名を使用できます:

```json
{
  "boundaries": {
    "tags": {
      "private": {
        "dependents": {
          "deny": ["@repo/my-pkg"]
        }
      }
    }
  }
}
```

## 重要なポイント

- ルールは推移的に適用されます（依存先の依存先にも適用）
- 大規模なプロジェクトでアーキテクチャの境界を強制するのに役立ちます
- ランタイム/ビルドエラーの前に違反を検出できます
