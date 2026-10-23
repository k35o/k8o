import { DB_CONTENT_CACHE_TAG } from '@repo/helpers/cache/main-cache-tags';
import { cacheLife, cacheTag } from 'next/cache';
import { notFound } from 'next/navigation';

import {
  findBlog,
  findBlogMetadata,
  getBlogToc as _getBlogToc,
} from '@/features/blog/application/blog';
import {
  getBlogsByTags as _getBlogsByTags,
  getBlogs,
} from '@/features/blog/application/blogs';
import { getFeatureBlogMap as _getFeatureBlogMap } from '@/features/blog/application/feature-blog-map';
import { getBlogOgCode as _getBlogOgCode } from '@/features/blog/application/og-code';
import { estimateReadingTimeMinutes } from '@/features/blog/application/reading-time';

import { getMarkdown } from './markdown';

export async function getBlogContents() {
  'use cache';
  cacheLife('max');
  cacheTag(DB_CONTENT_CACHE_TAG);

  const blogs = await getBlogs();
  const contents = await Promise.all(
    blogs.map(async (blog) => {
      // readingTimeもMDXを読むため、先にmetadataでファイルの存在を確かめてから読む
      const metadata = await findBlogMetadata(blog.slug);
      if (metadata === null) return null;
      const readingTime = await getBlogReadingTime(blog.slug);
      return {
        id: blog.id,
        slug: blog.slug,
        tags: blog.tags,
        title: metadata.title,
        description: metadata.description,
        createdAt: metadata.createdAt,
        updatedAt: metadata.updatedAt,
        readingTime,
      };
    }),
  );
  return contents.filter((content) => content !== null);
}

export async function findBlogContent(slug: string) {
  'use cache';
  cacheLife('max');
  cacheTag(DB_CONTENT_CACHE_TAG);

  const blog = await findBlog(slug);
  if (blog === null) {
    return null;
  }
  const metadata = await findBlogMetadata(slug);
  if (metadata === null) {
    return null;
  }

  return {
    id: blog.id,
    slug: blog.slug,
    tags: blog.tags,
    slideUrl: blog.slideUrl,
    title: metadata.title,
    description: metadata.description,
    createdAt: metadata.createdAt,
    updatedAt: metadata.updatedAt,
  };
}

export async function isPublishedBlog(slug: string): Promise<boolean> {
  'use cache';
  cacheLife('max');
  cacheTag(DB_CONTENT_CACHE_TAG);

  return (await findBlog(slug)) !== null;
}

export async function findBlogMarkdown(slug: string): Promise<string | null> {
  'use cache';
  cacheLife('max');

  // MDX が無いことは、このキャッシュの内側で null に読み替える。'use cache' から投げた
  // 例外は本番では code を持たないものに置き換わり、呼ぶ側で ENOENT と見分けられない
  const metadata = await findBlogMetadata(slug);
  if (metadata === null) {
    return null;
  }
  return getMarkdown(slug);
}

// 'use cache' の中で notFound() を投げないよう、キャッシュするのは DB 参照の結果だけにして
// 404 の判定はキャッシュの外で行う
export async function getBlogContent(slug: string) {
  const blog = await findBlogContent(slug);
  if (blog === null) {
    notFound();
  }
  return blog;
}

export async function getBlogOgCode(slug: string) {
  'use cache';
  cacheLife('max');

  const ogCode = await _getBlogOgCode(slug);
  return ogCode;
}

export async function getBlogToc(slug: string) {
  'use cache';
  cacheLife('max');

  const toc = await _getBlogToc(slug);
  return toc;
}

export async function getBlogsByTags(slug: string) {
  'use cache';
  cacheLife('max');
  cacheTag(DB_CONTENT_CACHE_TAG);

  const blog = await findBlogContent(slug);
  if (blog === null) {
    return [];
  }
  return _getBlogsByTags(
    slug,
    blog.tags.map((tag) => tag.id),
  );
}

export async function getBlogReadingTime(slug: string): Promise<number> {
  'use cache';
  cacheLife('max');

  const markdown = await getMarkdown(slug);
  return estimateReadingTimeMinutes(markdown);
}

export async function getFeatureBlogMap() {
  'use cache';
  cacheLife('max');
  cacheTag(DB_CONTENT_CACHE_TAG);

  const featureBlogMap = await _getFeatureBlogMap();
  return featureBlogMap;
}

export type { BlogLink } from '@/features/blog/application/feature-blog-map';
