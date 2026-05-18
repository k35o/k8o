# @repo/database AGENTS.md

Drizzle ORM + Turso (libSQL) のDBクライアントとスキーマを提供する。

## Conditional Export Maps による環境切り替え

`package.json` の `exports` で実行環境ごとにクライアントを切り替えている:

- `storybook` → `__mocks__/db.ts`（モックDB）
- `node` / `default` → 実DBクライアント

新規モジュールを追加するときは、Storybook 実行時にDBへ接続しないよう、必要に応じて `__mocks__/` 側にも対応する mock を用意すること。

## マイグレーション

```bash
pnpm run -F @repo/database migrate
```

## import 境界

`@repo/database` を直接 import するのは `apps/*/src/features/*/infrastructure/` を基本とする。`app/` や `features/*/interface` から直接読まない。

現時点ではこの境界は規約運用。今後 Biome から oxc に置き換える際に機械的なルールを導入予定。
