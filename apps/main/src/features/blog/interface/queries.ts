import { notFound } from '@k8ordo/framework';

import {
  getBlogs as _getBlogs,
  selectRelatedBlogs,
} from '@/features/blog/application/blogs';
import { buildDemoDocument } from '@/features/blog/application/demo-document';
import { getBlogDemos } from '@/features/blog/application/demos';
import type { BlogDemo } from '@/features/blog/application/demos';
import { buildFeatureBlogMap } from '@/features/blog/application/feature-blog-map';
import { getMarkdown } from '@/features/blog/application/markdown';
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

export const findBlogMarkdown = async (slug: string): Promise<string | null> =>
  (await findBlogContent(slug)) === null ? null : getMarkdown(slug);

// 記事の動く例の名前。/blog/:slug/demos/:demo の paths.ts が例の URL を作る
export const getBlogDemoNames = async (slug: string): Promise<string[]> =>
  (await getBlogDemos(slug)).map(({ name }) => name);

const demoScriptOf = async (slug: string, demo: BlogDemo): Promise<string> => {
  if (demo.tsx === '') {
    return demo.js;
  }
  // virtual:blog-demo-scripts は vite.config のプラグインだけが作り、テストと Storybook には無いので、
  // tsx の例を描くときにだけ読む
  const { getBundledDemoScript } =
    await import('@/features/blog/application/demo-scripts');
  return getBundledDemoScript(slug, demo.name);
};

// 記事の動く例の HTML。下書きの記事と、記事に無い名前の例は null
export const findBlogDemoDocument = async (
  slug: string,
  name: string,
): Promise<string | null> => {
  if ((await findBlogContent(slug)) === null) {
    return null;
  }
  const demo = (await getBlogDemos(slug)).find(
    (candidate) => candidate.name === name,
  );
  if (demo === undefined) {
    return null;
  }
  return buildDemoDocument({
    name: demo.name,
    html: demo.html,
    css: demo.css,
    script: await demoScriptOf(slug, demo),
  });
};

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

export { getBlogToc } from '@/features/blog/application/blog';
export { getBlogOgCode } from '@/features/blog/application/og-code';
export type { BlogLink } from '@/features/blog/application/feature-blog-map';
export type { HeadingTree } from '@/features/blog/application/toc-tree';
