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

import { BaselineStatus } from '@k8o/arte-odyssey/baseline-status';
import { MyDemo } from '@/app/_components/playgrounds/my-feature';
import { Playground } from '@/app/_components/playgrounds';

# タイトル

<BaselineStatus featureId="feature-id"></BaselineStatus>

{/* ここに記事の内容を執筆する */}
```

### 2. layout.tsx

`LayoutProps`の型パラメータには、実際のブログスラグを指定する（例: `/blog/my-article`）。

```typescript
import type { Metadata } from 'next';
import { getBlogContent } from '@/app/blog/_api';
import { BlogLayout } from '@/app/blog/_components/blog-layout';

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
      publishedTime: blog.createdAt.toString(),
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

export default function Layout({
  children,
}: LayoutProps<'/blog/my-article'>) { // 実際のスラグに置き換える
  return <BlogLayout slug={slug}>{children}</BlogLayout>;
}
```

### 3. opengraph-image.tsx

```typescript
import { OgImage } from '@/app/_components/og-image';
import { getBlogContent } from '@/app/blog/_api';

export const alt = '記事タイトル';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('{slug}');

  return await OgImage({
    category: 'Blog',
    title: blog.title,
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

生成されたSQLファイルに以下を記述：

```sql
-- 新しいタグが必要な場合
INSERT INTO tags (id, name) VALUES ({next_id}, 'タグ名');--> statement-breakpoint

-- ブログレコード
INSERT INTO blogs (id, slug, published, created_at)
VALUES ({next_id}, '{slug}', 1, '{date}T00:00:00.000Z');--> statement-breakpoint

-- ビューカウント初期化
INSERT INTO blog_views (blog_id, views) VALUES ({blog_id}, 0);--> statement-breakpoint

-- タグ紐付け
INSERT INTO blog_tag (blog_id, tag_id) VALUES ({blog_id}, {tag_id});
```

### タグの確認と追加

#### 既存タグの検索

```bash
# 全タグを検索
grep "INSERT INTO tags" packages/database/migrations/*.sql

# 特定のタグ名で検索（例：CSS関連）
grep "INSERT INTO tags" packages/database/migrations/*.sql | grep -i "css"
```

#### 次のタグIDを取得

```bash
grep "INSERT INTO tags" packages/database/migrations/*.sql | \
  grep -oE 'VALUES \([0-9]+' | grep -oE '[0-9]+' | sort -n | tail -1
```

結果に+1した値が次のタグID。

#### 次のブログIDを取得

```bash
grep "INSERT INTO blogs" packages/database/migrations/*.sql | \
  grep -oE 'VALUES \([0-9]+' | grep -oE '[0-9]+' | sort -n | tail -1
```

## チェックリスト

### ファイル作成

- [ ] `page.mdx` 雛形作成
- [ ] `layout.tsx` 作成
- [ ] `opengraph-image.tsx` 作成
- [ ] Playgroundコンポーネント作成（必要な場合）
- [ ] Storybookストーリー作成（必要な場合）
- [ ] `playgrounds/index.ts` 更新（必要な場合）

### データベース

- [ ] マイグレーションSQL作成
- [ ] `pnpm run -F @repo/database generate:custom` 実行済み

### 次のステップ

- [ ] 記事の内容を執筆（`/doc-coauthoring` スキルを使用可）
