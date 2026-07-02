---
name: blog-prep
description: k8oブログ記事の技術的準備ワークフロー。MDXファイル、レイアウト、OGP画像、Playgroundコンポーネント、マイグレーションなど必要なファイル一式を作成。記事の執筆は別途行う。
---

# ブログ記事準備スキル

このスキルは、k8oプロジェクトでブログ記事を公開するために必要な**技術的なファイル一式**を準備するワークフローを提供する。

## 対象範囲

### このスキルが行うこと

- ブログ記事に必要なファイル構造の作成
- layout.tsx、opengraph-image.tsxの作成
- Playgroundコンポーネントの雛形作成
- データベースマイグレーションの作成
- 空のpage.mdxファイルの作成

### このスキルが行わないこと

- 記事の内容の執筆・ライティング
- 記事の構成・アウトライン作成

> **注意**: 記事の執筆には `/doc-coauthoring` スキルを使用してください。

## 必要なファイル

新しいブログ記事を公開するには、以下のファイルが必要：

```
apps/main/src/app/blog/(articles)/{slug}/
├── page.mdx              # 記事本体
├── layout.tsx            # メタデータ・レイアウト
└── opengraph-image.tsx   # OGP画像生成
```

| ファイル | 必須 |
|---------|------|
| `page.mdx` | ✅ |
| `layout.tsx` | ✅ |
| `opengraph-image.tsx` | ✅ |
| Playground (`apps/main/src/app/_components/playgrounds/{feature-name}/`) | デモがある場合 |
| マイグレーション (`packages/database/migrations/`) | ✅ |

## ファイルテンプレート

### 1. page.mdx（雛形）

```mdx
---
title: 'タイトル'
description: '説明文（SEO用、100-160文字程度）'
createdAt: 2025-01-10
updatedAt: 2025-01-10
---

{/* 必要に応じてインポート */}
{/* import { BaselineStatus } from '@k8o/arte-odyssey'; */}
{/* import { MyDemo } from '@/app/_components/playgrounds/my-feature'; */}
{/* import { Playground } from '@/app/_components/playgrounds'; */}

# タイトル

{/* Baseline機能を紹介する記事の場合 */}
{/* <BaselineStatus featureId="feature-id"></BaselineStatus> */}

{/* ここに記事の内容を執筆する */}
```

### 2. layout.tsx

`LayoutProps`の型パラメータには、実際のブログスラグを指定する（例: `/blog/my-article`）。

```typescript
import type { Metadata } from 'next';

import { BlogLayout } from '@/app/blog/_components/blog-layout';
import { getBlogContent } from '@/features/blog/interface/queries';

const slug = 'my-article'; // 実際のスラグに置き換える

export async function generateMetadata(): Promise<Metadata> {
  const blog = await getBlogContent(slug);

  return {
    title: blog.title,
    description: blog.description,
    category: blog.tags.map((tag) => tag.name).join(', '),
    openGraph: {
      title: blog.title,
      description: blog.description ?? undefined,
      url: `https://k8o.me/blog/${slug}`,
      publishedTime: blog.createdAt,
      authors: ['k8o'],
      siteName: 'k8o',
      locale: 'ja',
      type: 'article',
    },
    twitter: {
      title: blog.title,
      card: 'summary_large_image',
      description: blog.description ?? undefined,
    },
  };
}

// 実際のスラグに置き換える
export default function Layout({ children }: LayoutProps<'/blog/my-article'>) {
  return <BlogLayout slug={slug}>{children}</BlogLayout>;
}
```

#### 数式（KaTeX）を使う記事の場合

数式の変換（remark-math + rehype-katex）は `next.config.ts` で全記事に効いているため、本文では `$...$`・`$$...$$`・` ```math ` フェンスがそのまま使える。ただし **KaTeX の CSS はグローバルには読み込まれない**（数式を使わない記事に配信しないため）。数式を使う記事は `layout.tsx` の先頭に以下の 2 行を追加する:

```typescript
import 'katex/dist/katex.min.css';
import '@/app/blog/_styles/katex-vertical.css';
```

忘れると `.katex-mathml` が隠れず**数式が二重表示に崩れる**。既存の例: `apps/main/src/app/blog/(articles)/font-family-math/layout.tsx`。

### 3. opengraph-image.tsx

```typescript
import { OgImage } from '@/app/_components/og-image';
import {
  getBlogContent,
  getBlogOgCode,
} from '@/features/blog/interface/queries';

export const alt = '記事タイトル';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  // 実際のスラグに置き換える
  const [blog, ogCode] = await Promise.all([
    getBlogContent('my-article'),
    getBlogOgCode('my-article'),
  ]);

  return OgImage({
    category: 'Blog',
    title: blog.title,
    code: ogCode ?? undefined,
  });
}
```

### 4. Playgroundコンポーネント（デモがある場合）

ディレクトリ名は機能の内容がわかる名前を使用する（例: `caret-position-from-point`, `event-timing`）。

```
apps/main/src/app/_components/playgrounds/{feature-name}/
├── {feature-name}-demo.tsx           # メインコンポーネント
├── {feature-name}-demo.stories.tsx   # Storybook
└── index.ts                          # エクスポート
```

#### index.tsの例

```typescript
import type { PlaygroundSection } from '../types';
import { MyDemo } from './my-demo';

export { MyDemo } from './my-demo';

export const mySection: PlaygroundSection = {
  id: 'my-feature',
  title: 'My Feature',
  description: '機能の説明',
  type: 'blog',
  slug: 'my-feature',
  demos: [{ component: MyDemo, title: 'デモタイトル' }],
};
```

#### playgrounds/index.tsへの追加

- `export * from './{slug}';` を追加
- `import { mySection } from './{slug}';` を追加
- `playgroundSections` 配列に追加

## データベースマイグレーション

### マイグレーションファイルの生成

```bash
pnpm run -F @repo/database generate:custom
```

### SQLの記述

> **重要: id を手で振らない。** タグは `name`、ブログは `slug`（どちらも UNIQUE）で引く。
> これにより admin で作成・編集したタグと **id が衝突せず**、再適用しても安全（冪等）になる。
> 埋めるのは **slug・日付・タグ名** だけ。`{next_id}` のような採番作業は不要。

生成されたSQLファイルに以下を記述：

```sql
-- タグ: id は書かない。既存（admin 作成分も含む）なら何もしない
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
> admin でタグをリネームした場合は、以降の migration では新しい name を使う。
> スライド/トークを migration で投入する場合も、同様に id を書かず slug / name で引く。

### タグ名の確認

id は採番しないので、必要なのは **既存タグの正確な name** を知ることだけ（表記ゆれ防止）。

```bash
# 既存タグ名の一覧（旧形式 (id, name) も新形式 (name) も拾う）
grep -rhoE "INSERT INTO tags [^;]*'[^']+'" packages/database/migrations/*.sql \
  | grep -oE "'[^']+'" | sort -u
```

- 既存タグはそのままの name で紐付ける（新規 INSERT は不要、`ON CONFLICT` で安全だが書かなくてよい）。
- 新規タグは `INSERT INTO tags (name) VALUES ('新タグ') ON CONFLICT (name) DO NOTHING;` を足すだけ。
- admin のタグ画面（`/tags`）でも既存タグ名・使用数を確認できる。

## チェックリスト

### ファイル作成

- [ ] `page.mdx` 雛形作成
- [ ] `layout.tsx` 作成
- [ ] 数式（`$`・`$$`・` ```math `）を使う場合: `layout.tsx` に KaTeX CSS を import
- [ ] `opengraph-image.tsx` 作成
- [ ] Playgroundコンポーネント作成（必要な場合）
- [ ] Storybookストーリー作成（必要な場合）
- [ ] `playgrounds/index.ts` 更新（必要な場合）

### データベース

- [ ] マイグレーションSQL作成
- [ ] `pnpm run -F @repo/database generate:custom` 実行済み

### 次のステップ

- [ ] 記事の内容を執筆（`/doc-coauthoring` スキルを使用可）
