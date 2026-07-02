import { cacheLife, cacheTag } from 'next/cache';

import {
  getBlogToc as _getBlogToc,
  getBlog,
  getBlogMetadata,
} from '@/features/blog/application/blog';
import {
  getBlogsByTags as _getBlogsByTags,
  getBlogs,
} from '@/features/blog/application/blogs';
import { getFeatureBlogMap as _getFeatureBlogMap } from '@/features/blog/application/feature-blog-map';
import { getBlogOgCode as _getBlogOgCode } from '@/features/blog/application/og-code';
import { estimateReadingTimeMinutes } from '@/features/blog/application/reading-time';
import { DB_CONTENT_CACHE_TAG } from '@/shared/cache/cache-tags';

import { getMarkdown } from './markdown';

export async function getBlogContents() {
  'use cache';
  cacheLife('max');
  cacheTag(DB_CONTENT_CACHE_TAG);

  const blogs = await getBlogs();
  return Promise.all(
    blogs.map(async (blog) => {
      const [metadata, readingTime] = await Promise.all([
        getBlogMetadata(blog.slug),
        getBlogReadingTime(blog.slug),
      ]);
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
}

export async function getBlogContent(slug: string) {
  'use cache';
  cacheLife('max');
  cacheTag(DB_CONTENT_CACHE_TAG);

  const blog = await getBlog(slug);
  const metadata = await getBlogMetadata(slug);

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

  const blog = await getBlogContent(slug);
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
