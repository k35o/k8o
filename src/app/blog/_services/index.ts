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

export const getBlogsByTags = cache(async (slug: string) => {
  const blog = await getBlog(slug);
  const tagIds = blog.tags.map((tag) => tag.id);

  const blogIds = (
    await db.query.blogTag.findMany({
      where: (blogTag, { inArray }) => inArray(blogTag.tagId, tagIds),
      columns: {
        blogId: true,
      },
    })
  ).map((blogTag) => blogTag.blogId);

  const blogs = await db.query.blogs.findMany({
    where: (blogs, { not, eq, inArray, and }) =>
      and(not(eq(blogs.slug, slug)), inArray(blogs.id, blogIds)),
    with: {
      blogTag: {
        with: {
          tag: true,
        },
      },
    },
    orderBy(fields, operators) {
      return [operators.desc(fields.createdAt)];
    },
  });

  return Promise.all(
    blogs
      .sort((a, b) => {
        const aBlogTagIds = a.blogTag.map(
          (blogTag) => blogTag.tag.id,
        );
        const bBlogTagIds = b.blogTag.map(
          (blogTag) => blogTag.tag.id,
        );
        const aTagCount = tagIds.filter((tagId) =>
          aBlogTagIds.includes(tagId),
        ).length;
        const bTagCount = tagIds.filter((tagId) =>
          bBlogTagIds.includes(tagId),
        ).length;
        return bTagCount - aTagCount;
      })
      .slice(0, 6)
      .map(async (blog) => {
        const blogMetadata = await getFrontmatter(
          join(cwd(), `src/app/blog/${blog.slug}/page.mdx`),
        );
        return {
          id: blog.id,
          slug: blog.slug,
          title: blogMetadata.title,
          createdAt: blogMetadata.createdAt,
          tags: blog.blogTag.map((blogTag) => blogTag.tag.name),
        };
      }),
  );
});

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
