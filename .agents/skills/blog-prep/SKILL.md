---
name: blog-prep
description: k8oブログ記事の技術的準備ワークフロー。MDXファイル、Playgroundコンポーネント、マイグレーションなど必要なファイル一式を作成。記事の執筆は別途行う。
---

# ブログ記事準備スキル

このスキルは、k8oプロジェクトでブログ記事を公開するために必要な**技術的なファイル一式**を準備するワークフローを提供する。

## 対象範囲

### このスキルが行うこと

- ブログ記事に必要なファイル構造の作成
- Playgroundコンポーネントの雛形作成
- データベースマイグレーションの作成
- 空のarticle.mdxファイルの作成

### このスキルが行わないこと

- 記事の内容の執筆・ライティング
- 記事の構成・アウトライン作成

## 必要なファイル

新しいブログ記事を公開するには、以下のファイルが必要：

```
apps/main/src/content/blog/{slug}/
├── article.mdx   # 記事本体
├── _images/      # 記事の画像（使う場合）
└── _components/  # この記事だけの部品（使う場合）
```

| ファイル | 必須 |
|---------|------|
| `article.mdx` | ✅ |
| Playground (`apps/main/src/app/_components/playgrounds/{feature-name}/`) | デモがある場合 |
| マイグレーション (`packages/database/migrations/`) | ✅ |

記事のページ（`/blog/{slug}`）のレイアウトとメタデータ、OGP画像（`/blog/{slug}/og.png`）は、`apps/main/src/app/blog/[slug]/` が全記事に共通で作る。記事ごとの `layout.tsx` や `opengraph-image.tsx` は作らない。

## ファイルテンプレート

### 1. article.mdx（雛形）

```mdx
---
title: 'タイトル'
description: '説明文（SEO用、100-160文字程度）'
createdAt: 2025-01-10
updatedAt: 2025-01-10
featureIds:
  - feature-id
---

# タイトル

<BrowserSupportStatus featureId="feature-id" />

{/* ここに記事の内容を執筆する */}

<PlaygroundEmbed demo="デモタイトル" sectionId="my-feature" />
```

- 記事で使う部品（`BrowserSupportStatus`・`PlaygroundEmbed`・`Playground`・`LinkCard`・`Image`・`FloatImage`・`Alert`）は `apps/main/src/app/blog/_components/blog-mdx-components` の `blogMdxComponents` で渡されるので、import しない。MDX から `@/app/...` を import すると、`features/blog/application/article-files.test.ts` が落ちる
- 記事の画像は `_images/` に、この記事だけの部品は `_components/` に置き、`./_images/...`・`./_components/...` の相対パスで import する
- `featureIds` には紹介する Web 機能の web-features の ID を書き、H1 の直下に同じ ID の `<BrowserSupportStatus featureId="..." />` を置く。`featureIds` に書いた機能は `/browser-support` からこの記事へリンクされる。Web 機能を紹介しない記事では、`featureIds` と `<BrowserSupportStatus>` を書かない
- `<PlaygroundEmbed>` の `sectionId` にはセクションの `id`、`demo` にはデモの `title` を渡す（`demo` を省くとセクションの全デモが並ぶ）。Playground が無い記事では、`<PlaygroundEmbed>` を書かない
- OGP画像には記事のタイトルが入る。コードが主役の記事では、載せたいコードブロックの1つに `// [!og]` を書くと、そのコードも描かれる

### 2. 数式（KaTeX）を使う記事

数式の変換（`@repo/mdx-preset` の remark・rehype の preset。remark-math と KaTeX）は `next.config.ts` で全記事に効いているため、本文では `$...$`・`$$...$$`・` ```math ` フェンスがそのまま使える。KaTeX の CSS は記事が自分で持つので、数式を使う記事の `article.mdx` が import する。frontmatter の直後に以下の 1 行を追加する（縦書きの調整も同じ CSS に入っている）:

```mdx
import '@repo/mdx-preset/katex.css';
```

今の Next のビルドでは、記事の CSS は `/blog/[slug]` の1つのルートにまとまり、ほかの数式の記事の import ですべての記事のページに載る。そのため import を忘れても見た目では気づけない。抜けは `apps/main/src/features/blog/application/article-files.test.ts` が落とす。既存の例: `apps/main/src/content/blog/font-family-math/article.mdx`。

### 3. Playgroundコンポーネント（デモがある場合）

ディレクトリ名は機能の内容がわかる名前を使用する（例: `caret-position-from-point`, `event-timing`）。

```
apps/main/src/app/_components/playgrounds/{feature-name}/
├── {demo-name}-demo.tsx           # デモ本体
├── {demo-name}-demo.module.css    # デモのスタイル
├── {demo-name}-demo.stories.tsx   # Storybook
└── index.ts                       # セクションの定義
```

デモが1つなら `{demo-name}` は `{feature-name}` と同じにする。デモが複数あるときは、デモごとに3つのファイルを置く（例: `scope/`）。

#### デモ本体とスタイル

スタイルは CSS Modules で書き、値は @k8ordo/ui のトークンだけを使う（規約はルートの `CLAUDE.md` の「UI共通」）。

紹介する CSS そのものを見せるデモでは、その CSS を文字列で持ち、`<style>` で当てて、同じ文字列を `<pre><code>` で表示する。`<style>` の中身はページ全体に効くので、セレクタのクラス名にはほかのデモと衝突しない接頭辞を付ける。

```tsx
import styles from './my-feature-demo.module.css';

const demoStyle = `.mf-target {
  text-decoration-line: underline;
}`;

export function MyFeatureDemo() {
  return (
    <div className={styles.root}>
      <style>{demoStyle}</style>
      <p className="mf-target">対象の要素</p>
      <pre className={styles.code}>
        <code>{demoStyle}</code>
      </pre>
    </div>
  );
}
```

```css
.root {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 6);
}

.code {
  margin-block: 0;
  overflow-x: auto;
  color: var(--color-fg-mute);
  font-size: var(--font-size-xs);
  line-height: var(--line-height-xs);
}
```

#### Storybookの例

```tsx
import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { MyFeatureDemo } from './my-feature-demo';

const playgroundTitle = MyFeatureDemo.name;

const meta = preview.meta({
  title: 'playgrounds/my-feature/MyFeatureDemo',
  component: MyFeatureDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
```

#### index.tsの例

```typescript
import type { PlaygroundSection } from '../types';
import { MyFeatureDemo } from './my-feature-demo';

export const myFeatureSection: PlaygroundSection = {
  id: 'my-feature',
  title: 'My Feature',
  description: '機能の説明',
  category: 'css', // css・html・js-api・performance・react のいずれか
  type: 'blog',
  slug: 'my-feature',
  demos: [
    {
      component: MyFeatureDemo,
      title: 'デモタイトル',
      description: 'デモの説明',
    },
  ],
};
```

#### playgrounds/sections.tsへの追加

- `import { myFeatureSection } from './{feature-name}';` を追加
- `playgroundSections` 配列に追加

## データベースマイグレーション

### マイグレーションファイルの生成

```bash
pnpm run -F @repo/database generate:custom
```

### SQLの記述

> **重要: id を手で振らない。** タグは `name`、ブログは `slug`（どちらも UNIQUE）で引く。
> これにより autoincrement で採番済みのタグと **id が衝突せず**、再適用しても安全（冪等）になる。
> 埋めるのは **slug・日付・タグ名** だけ。

生成されたSQLファイルに以下を記述：

```sql
-- タグ: id は書かない。既存なら何もしない
INSERT INTO tags (name) VALUES ('タグ名') ON CONFLICT (name) DO NOTHING;--> statement-breakpoint

-- ブログ: slug が一意なので id は書かない
INSERT INTO blogs (slug, published, created_at)
VALUES ('{slug}', 1, '{date}T00:00:00.000Z') ON CONFLICT (slug) DO NOTHING;--> statement-breakpoint

-- ビューカウント初期化（ブログは slug で引く）
INSERT INTO blog_views (blog_id, views)
VALUES ((SELECT id FROM blogs WHERE slug = '{slug}'), 0)
ON CONFLICT (blog_id) DO NOTHING;--> statement-breakpoint

-- タグ紐付け（ブログは slug、タグは name で引く。タグの数だけ繰り返す）
INSERT INTO blog_tag (blog_id, tag_id) VALUES (
  (SELECT id FROM blogs WHERE slug = '{slug}'),
  (SELECT id FROM tags WHERE name = 'タグ名')
) ON CONFLICT DO NOTHING;
```

> **注意**: 紐付けで参照するタグ名は、既存の **正確な name** と一致させること（`(SELECT id FROM tags WHERE name = ...)` が該当なしだと migration が落ちる）。
> タグをリネームした場合は、以降の migration では新しい name を使う。
> スライド/トークを migration で投入する場合も、同様に id を書かず slug / name で引く。

### 公開・非公開の切り替え

公開状態は `blogs.published` を書き換えるマイグレーションでだけ変える。下書きのまま入れるときは上の INSERT の `published` を `0` にし、公開するときに別のマイグレーションで書き換える。

```sql
UPDATE blogs SET published = 1 WHERE slug = '{slug}';
```

マージすると CI が本番の DB にマイグレーションを流し、そのあと main をビルドしてデプロイするので、公開は main のデプロイと同時に反映される。

### タグ名の確認

id は採番しないので、必要なのは **既存タグの正確な name** を知ることだけ（表記ゆれ防止）。

```bash
# 既存タグ名の一覧（(id, name) を書いた INSERT も (name) だけの INSERT も拾う）
grep -rhoE "INSERT INTO tags [^;]*'[^']+'" packages/database/migrations/*.sql \
  | grep -oE "'[^']+'" | sort -u
```

- 既存タグはそのままの name で紐付ける（新規 INSERT は不要、`ON CONFLICT` で安全だが書かなくてよい）。
- 新規タグは `INSERT INTO tags (name) VALUES ('新タグ') ON CONFLICT (name) DO NOTHING;` を足すだけ。

## チェックリスト

### ファイル作成

- [ ] `apps/main/src/content/blog/{slug}/article.mdx` 雛形作成（Web 機能の記事なら `featureIds` と `<BrowserSupportStatus>` の ID をそろえる）
- [ ] 数式（`$`・`$$`・` ```math `）を使う場合: `article.mdx` に KaTeX の CSS を import
- [ ] Playgroundのデモと `.module.css` 作成（必要な場合）
- [ ] Storybookストーリー作成（必要な場合）
- [ ] `playgrounds/sections.ts` 更新（必要な場合）

### データベース

- [ ] マイグレーションSQL作成
- [ ] `pnpm run -F @repo/database generate:custom` 実行済み

### 次のステップ

- [ ] 記事の内容を執筆し、公開前に `/blog-review` でレビューする
