# @repo/ai-database CLAUDE.md

ai（`apps/ai`）の DB。Better Auth の認証テーブル（user / session / account / verification）と `ai_*` を持つ。k8o の DB（`@repo/database`）とは Turso の DB も資格情報も別で、使うのは ai と `@repo/auth-shell` だけ。

## 構成

- `src/db.ts` … `AI_TURSO_DATABASE_URL` / `AI_TURSO_AUTH_TOKEN` でつなぐクライアント。`storybook` 条件では `src/__mocks__/db.ts`
- `src/auth.ts` … Better Auth の設定。`drizzleAdapter` には schema を渡さず、db に載せたスキーマから user などを探すので、認証のテーブルは `src/schema/index.ts` の `schema` に必ず入れる
- `src/orm.ts` … drizzle の演算子と、同じテーブルを別名で結合する `alias` の再エクスポート（apps は drizzle-orm に直接依存しない）
- `src/schema/public.ts` … クライアントに依存しない型の公開エントリ

## マイグレーション

```bash
pnpm run -F @repo/ai-database generate  # スキーマの変更からマイグレーションを作る（コミットする）
```

本番（Turso の `ai`）には `.github/workflows/vercel-prebuilt.yml` の migrate ジョブが、どのアプリのビルドよりも先に流す。preview（`ai-preview`）には、ai の deploy ジョブがビルドの前に流す。ローカル用の DB は用意していない。

ほかのブランチとマイグレーションの番号が衝突したら、番号を手で付け替えず、generate で作り直す。付け替えると `_journal.json` の `when` が古いまま残り、migrate がエラーを出さずにそのマイグレーションを飛ばす（CI が落とす）。

preview の ai は認証が OFF で、id が `local` の user として書き込む。libSQL は外部キーを強制するので、`ai-preview` には id が `local` の user 行を入れておく。
