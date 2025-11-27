import { cacheLife } from 'next/cache';
import {
  getBlogToc as _getBlogToc,
  getBlog,
  getBlogMetadata,
} from '@/services/blogs/blog';
import {
  getBlogsByTags as _getBlogsByTags,
  getBlogs,
} from '@/services/blogs/blogs';
import { getBlogView as _getBlogView } from '@/services/blogs/view';

export async function getBlogContents() {
  'use cache';

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
}

export async function getBlogContent(slug: string) {
  'use cache';

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

export async function getBlogToc(slug: string) {
  'use cache';

  return await _getBlogToc(slug);
}

export async function getBlogsByTags(slug: string) {
  'use cache';

  const blog = await getBlogContent(slug);
  return await _getBlogsByTags(
    slug,
    blog.tags.map((tag) => tag.id),
  );
}

export async function getBlogView(id: number) {
  'use cache';
  cacheLife('minutes');

  return await _getBlogView(id);
}
