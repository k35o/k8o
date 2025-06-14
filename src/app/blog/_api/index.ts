import {
  getBlog,
  getBlogMetadata,
  getBlogToc as _getBlogToc,
} from '@/services/blogs/blog';
import {
  getBlogs,
  getBlogsByTags as _getBlogsByTags,
} from '@/services/blogs/blogs';
import { getBlogView as _getBlogView } from '@/services/blogs/view';
import { unstable_cache as cache } from 'next/cache';

export const getBlogContents = cache(async () => {
  const blogs = await getBlogs();
  return await Promise.all(
    blogs.map(async (blog) => {
      const metadata = await getBlogMetadata(blog.slug);
      return {
        id: blog.id,
        slug: blog.slug,
        tags: blog.tags,
        title: metadata.title,
        description: metadata.description,
        createdAt: metadata.createdAt,
        updatedAt: metadata.updatedAt,
      };
    }),
  );
});

export const getBlogContent = cache(async (slug: string) => {
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
});

export const getBlogToc = cache(async (slug: string) => {
  return await _getBlogToc(slug);
});

export const getBlogsByTags = cache(async (slug: string) => {
  const blog = await getBlogContent(slug);
  return await _getBlogsByTags(
    slug,
    blog.tags.map((tag) => tag.id),
  );
});

export const getBlogView = cache(
  async (id: number) => {
    return _getBlogView(id);
  },
  ['blogView'],
  {
    tags: ['blog', 'blogView'],
    revalidate: 60,
  },
);
