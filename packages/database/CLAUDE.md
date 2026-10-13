# @repo/database CLAUDE.md

Drizzle ORM + Turso (libSQL) のDBクライアントとスキーマを提供する。

## Conditional Export Maps による環境切り替え

`package.json` の `exports` で実行環境ごとにクライアントを切り替えている:

- `storybook` → `__mocks__/db.ts`（モックDB）
- `node` / `default` → 実DBクライアント

新規モジュールを追加するときは、Storybook 実行時にDBへ接続しないよう、必要に応じて `__mocks__/` 側にも対応する mock を用意すること。

## 接続

`K8O_TURSO_DATABASE_URL` / `K8O_TURSO_AUTH_TOKEN` でつなぐ（Turso の本番は `k8o`、preview は `k8o-preview`）。トークンは使う側ごとに分ける。本番の main は読み取り専用、api と CI の migrate は読み書き。preview は main の deploy ジョブが migrate するので、main にも読み書きのトークンを渡す。Vercel では、URL（本番と preview）と preview のトークンを Shared Environment Variables に置いて main と api に紐づけ、値が違う本番のトークンだけをプロジェクトごとに置く。DB は Turso の default グループにあり、`turso db tokens invalidate` は使えない。失効は `turso group tokens invalidate default` で、ai の DB のトークンもまとめて失効する（starter はグループが1つ）。

本番のビルドには、`.github/workflows/vercel-prebuilt.yml` が production Environment の secrets から、アプリがビルドで読む DB の分だけ接続情報を渡す。main には読み取り専用の `K8O_TURSO_READONLY_AUTH_TOKEN` を `K8O_TURSO_AUTH_TOKEN` として渡す。api はビルドで DB を読まないので、何も渡さない。

## マイグレーション

```bash
pnpm run -F @repo/database generate  # スキーマの変更からマイグレーションを作る（コミットする）
pnpm run -F @repo/database migrate   # ローカルの DB に流す
```

本番 DB には、`.github/workflows/vercel-prebuilt.yml` の migrate ジョブが、どのアプリのビルドよりも先に流す。preview DB には、main の deploy ジョブがビルドの前に流す（preview の Environment は承認が要るので、別ジョブにすると承認が2回になる）。Vercel のビルドでは generate も migrate もしない。コミットされていないマイグレーションは CI（`ci.yml`）が落とす。

マイグレーションは新しいコードより先に当たる。列やテーブルを消すときは、先にそれを使わないコードをデプロイしてから、消すマイグレーションを出す。

ほかのブランチとマイグレーションの番号が衝突したら、番号を手で付け替えず、generate（seed なら generate:custom）で作り直す。付け替えると `_journal.json` の `when` が古いまま残り、migrate がエラーを出さずにそのマイグレーションを飛ばす（CI が落とす）。

### コンテンツ系の seed INSERT は id を書かない

blogs / slides / talks / tags のようにコンテンツを seed する INSERT では、**id を手で振らない**こと。本番にはマイグレーションの外で autoincrement 採番された行があり、id を固定すると**衝突して `migrate` が失敗する**。

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

この境界は oxc カスタムルール `k8o/database-import-boundary`（`packages/oxlint-plugin`）で機械的に強制される。許可される場所の全体像はルートの CLAUDE.md を参照。
