import { join } from 'path';
import { cwd } from 'process';
import { db } from '#database/db';
import { blogViews } from '@/database/schema/blog-views';
import { increment } from '@/database/utils';
import { getFrontmatter } from '@/utils/mdx/frontmatter';
import { getTocTree } from '@/utils/mdx/toc-tree';
import { eq } from 'drizzle-orm';
import { unstable_cache as cache } from 'next/cache';

export const getBlogs = cache(async () => {
  const blogs = await db.query.blogs.findMany({
    with: {
      blogTag: {
        with: {
          tag: true,
        },
      },
    },
    limit: 50,
    orderBy(fields, operators) {
      return operators.desc(fields.createdAt);
    },
  });

  return blogs.map((blog) => ({
    id: blog.id,
    slug: blog.slug,
    tags: blog.blogTag.map((blogTag) => blogTag.tag.name),
  }));
});

export const getBlog = cache(async (slug: string) => {
  const blog = await db.query.blogs.findFirst({
    where: (blog, { eq }) => eq(blog.slug, slug),
    with: {
      blogTag: {
        with: {
          tag: true,
        },
      },
    },
  });

  if (!blog) {
    throw new Error(`Blog with slug ${slug} not found`);
  }

  return {
    id: blog.id,
    slug: blog.slug,
    tags: blog.blogTag.map((blogTag) => ({
      id: blogTag.tag.id,
      name: blogTag.tag.name,
    })),
  };
});

export const getBlogMetadata = cache(async (slug: string) =>
  getFrontmatter(join(cwd(), `src/app/blog/${slug}/page.mdx`)),
);

export const getBlogToc = cache(async (slug: string) =>
  getTocTree(join(cwd(), `src/app/blog/${slug}/page.mdx`)),
);

export const getBlogView = async (slug: string): Promise<number> => {
  const blog = await getBlog(slug);

  return cache(
    async (blogId: number) =>
      await db.query.blogViews
        .findFirst({
          where: (blogViews, { eq }) => eq(blogViews.blogId, blogId),
        })
        .then((res) => res?.views ?? 0),
    ['blogView'],
    {
      tags: ['blog', 'blogView'],
      revalidate: 60,
    },
  )(blog.id);
};

export const incrementBlogView = async (slug: string) => {
  const blog = await getBlog(slug);

  return db
    .update(blogViews)
    .set({
      views: increment(blogViews.views),
    })
    .where(eq(blogViews.blogId, blog.id));
};
