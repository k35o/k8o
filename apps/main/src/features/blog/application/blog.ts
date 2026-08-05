import { readFile } from 'node:fs/promises';

import { db } from '@repo/database';
import { findFrontmatter, getFrontmatter } from '@repo/helpers/mdx/frontmatter';
import type { Frontmatter } from '@repo/helpers/mdx/frontmatter';

import { getTocTree } from '@/shared/mdx/toc-tree';

import { blogPath } from './path';

export const getBlog = async (slug: string) => {
  const blog = await db.query.blogs.findFirst({
    where: (blogFields, { eq }) => eq(blogFields.slug, slug),
    with: {
      blogTag: {
        with: {
          tag: true,
        },
      },
      talks: true,
    },
  });

  if (!blog) {
    throw new Error(`Blog not found: ${slug}`);
  }

  return {
    id: blog.id,
    slug: blog.slug,
    tags: blog.blogTag.map((blogTag) => ({
      id: blogTag.tag.id,
      name: blogTag.tag.name,
    })),
    slideUrl: blog.talks[0]?.slideUrl,
  };
};

export const findPublishedBlogId = async (
  slug: string,
): Promise<number | null> => {
  const blog = await db.query.blogs.findFirst({
    where: (blogFields, { and, eq }) =>
      and(eq(blogFields.slug, slug), eq(blogFields.published, true)),
    columns: {
      id: true,
    },
  });

  return blog?.id ?? null;
};

export const getBlogMetadata = (slug: string) => getFrontmatter(blogPath(slug));

// DBのslugに対応するMDXが無いことがある（共有ローカルDBに他worktreeの
// 執筆中記事のslugが混ざる等）。一覧系でその記事だけスキップできるよう、
// ファイル欠損はエラーにせずnullで返す。
export const findBlogMetadata = async (
  slug: string,
): Promise<Frontmatter | null> => {
  const metadata = await findFrontmatter(blogPath(slug));
  if (metadata === null) {
    console.warn(
      `ブログ "${slug}" のMDXファイルが存在しないため一覧から除外します`,
    );
  }
  return metadata;
};

export const getBlogToc = async (slug: string) =>
  getTocTree(await readFile(blogPath(slug), 'utf-8'));
