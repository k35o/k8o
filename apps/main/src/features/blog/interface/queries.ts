import { notFound } from '@k8ordo/framework';

import { getBlogToc as _getBlogToc } from '@/features/blog/application/blog';
import {
  getBlogs as _getBlogs,
  selectRelatedBlogs,
} from '@/features/blog/application/blogs';
import { buildFeatureBlogMap } from '@/features/blog/application/feature-blog-map';
import { getMarkdown } from '@/features/blog/application/markdown';
import { getBlogOgCode as _getBlogOgCode } from '@/features/blog/application/og-code';
import { estimateReadingTimeMinutes } from '@/features/blog/application/reading-time';
import { memoizeInBuild } from '@/shared/cache/memoize-in-build';

// 一覧・詳細・関連記事・paths はどれもこの 1 つの一覧から引く。公開していない記事と MDX の無い記事は見つからない
const getBlogs = memoizeInBuild(_getBlogs);

export const getBlogReadingTime = memoizeInBuild(
  async (slug: string): Promise<number> =>
    estimateReadingTimeMinutes(await getMarkdown(slug)),
);

export const getBlogContents = memoizeInBuild(async () =>
  Promise.all(
    (await getBlogs()).map(async (blog) => ({
      id: blog.id,
      slug: blog.slug,
      tags: blog.tags.map((tag) => tag.name),
      title: blog.title,
      description: blog.description,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
      readingTime: await getBlogReadingTime(blog.slug),
    })),
  ),
);

export const findBlogContent = async (slug: string) => {
  const blog = (await getBlogs()).find((content) => content.slug === slug);
  if (blog === undefined) {
    return null;
  }
  return {
    id: blog.id,
    slug: blog.slug,
    tags: blog.tags,
    slideUrl: blog.slideUrl,
    title: blog.title,
    description: blog.description,
    createdAt: blog.createdAt,
    updatedAt: blog.updatedAt,
  };
};

export const getBlogContent = async (slug: string) => {
  const blog = await findBlogContent(slug);
  if (blog === null) {
    notFound();
  }
  return blog;
};

export const findBlogMarkdown = memoizeInBuild(
  async (slug: string): Promise<string | null> =>
    (await findBlogContent(slug)) === null ? null : getMarkdown(slug),
);

export const getBlogOgCode = memoizeInBuild(_getBlogOgCode);

export const getBlogToc = memoizeInBuild(_getBlogToc);

export const getBlogsByTags = async (slug: string) =>
  selectRelatedBlogs(await getBlogs(), slug).map((blog) => ({
    id: blog.id,
    slug: blog.slug,
    title: blog.title,
    createdAt: blog.createdAt,
    tags: blog.tags.map((tag) => tag.name),
  }));

export const getFeatureBlogMap = async () =>
  buildFeatureBlogMap(await getBlogs());

export type { BlogLink } from '@/features/blog/application/feature-blog-map';
export type { HeadingTree } from '@/features/blog/application/toc-tree';
