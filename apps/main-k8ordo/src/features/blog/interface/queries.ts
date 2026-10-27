import { notFound } from '@k8ordo/framework';

import {
  findBlog,
  findBlogMetadata,
  getBlogToc as _getBlogToc,
} from '@/features/blog/application/blog';
import {
  getBlogsByTags as _getBlogsByTags,
  getBlogs,
} from '@/features/blog/application/blogs';
import { getBlogOgCode as _getBlogOgCode } from '@/features/blog/application/og-code';
import { estimateReadingTimeMinutes } from '@/features/blog/application/reading-time';
import { memoizeInBuild } from '@/shared/cache/memoize-in-build';

import { getMarkdown } from './markdown';

export const getBlogReadingTime = memoizeInBuild(
  async (slug: string): Promise<number> =>
    estimateReadingTimeMinutes(await getMarkdown(slug)),
);

export const getBlogContents = memoizeInBuild(async () => {
  const blogs = await getBlogs();
  return Promise.all(
    blogs.map(async (blog) => ({
      id: blog.id,
      slug: blog.slug,
      tags: blog.tags,
      title: blog.title,
      description: blog.description,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
      readingTime: await getBlogReadingTime(blog.slug),
    })),
  );
});

export const findBlogContent = memoizeInBuild(async (slug: string) => {
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
});

export const isPublishedBlog = memoizeInBuild(
  async (slug: string): Promise<boolean> => (await findBlog(slug)) !== null,
);

export const findBlogMarkdown = memoizeInBuild(
  async (slug: string): Promise<string | null> => {
    const metadata = await findBlogMetadata(slug);
    if (metadata === null) {
      return null;
    }
    return getMarkdown(slug);
  },
);

export const getBlogContent = async (slug: string) => {
  const blog = await findBlogContent(slug);
  if (blog === null) {
    notFound();
  }
  return blog;
};

export const getBlogOgCode = memoizeInBuild(_getBlogOgCode);

export const getBlogToc = memoizeInBuild(_getBlogToc);

export const getBlogsByTags = memoizeInBuild(async (slug: string) => {
  const blog = await findBlogContent(slug);
  if (blog === null) {
    return [];
  }
  return _getBlogsByTags(
    slug,
    blog.tags.map((tag) => tag.id),
  );
});
