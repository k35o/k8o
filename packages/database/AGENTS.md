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

### コンテンツ系の seed INSERT は id を書かない

blogs / slides / talks / tags のようにコンテンツを seed する INSERT では、**id を手で振らない**こと。admin から作成・編集できるようになったため、id を固定すると admin が autoincrement で採番した行と**衝突して `migrate` が失敗する**。

- 自然キー（tags は `name`、blogs / slides は `slug`）で挿入し、`ON CONFLICT (...) DO NOTHING` で冪等にする
- 関連テーブル（blog_tag 等）は id を直書きせず `(SELECT id FROM tags WHERE name = '...')` のようにキーで引く
- ブログ記事まわりの具体的なテンプレートは `blog-prep` スキルを参照

```sql
INSERT INTO tags (name) VALUES ('CSS') ON CONFLICT (name) DO NOTHING;--> statement-breakpoint
INSERT INTO blogs (slug, published, created_at)
  VALUES ('my-post', 1, '2026-01-01T00:00:00.000Z') ON CONFLICT (slug) DO NOTHING;--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (
  (SELECT id FROM blogs WHERE slug = 'my-post'),
  (SELECT id FROM tags WHERE name = 'CSS')
) ON CONFLICT DO NOTHING;
```

## import 境界

`@repo/database` を直接 import するのは `apps/*/src/features/*/infrastructure/` を基本とする。`app/` や `features/*/interface` から直接読まない。

現時点ではこの境界は規約運用。今後 Biome から oxc に置き換える際に機械的なルールを導入予定。
