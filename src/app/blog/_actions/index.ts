'use server';

import { Blog } from '../_types';
import { db } from '#database/db';
import * as schema from '@/database/schema';
import { AnyColumn, eq, InferSelectModel, sql } from 'drizzle-orm';
import { unstable_cache as cache } from 'next/cache';

export const getBlogs = async (): Promise<Blog[]> => {
  return cache(getBlogsWithoutCache, ['blog'])();
};

export const getBlogsWithoutCache = async (): Promise<Blog[]> => {
  const blog = await db.query.blogs.findMany({
    with: {
      blogTag: {
        with: {
          tag: true,
        },
      },
    },
    limit: 10,
    orderBy(fields, operators) {
      return operators.desc(fields.createdAt);
    },
  });

  return blog.map((blog) => ({
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    description: blog.description,
    tags: blog.blogTag.map((blogTag) => blogTag.tag.name),
    createdAt: blog.createdAt,
    updatedAt: blog.updatedAt,
  }));
};

export const getBlog = async ({
  slug,
}: {
  slug: InferSelectModel<typeof schema.blogs>['slug'];
}): Promise<Blog | undefined> => {
  return cache(
    async (slug: string) => getBlogWitoutCache({ slug }),
    ['blog'],
  )(slug);
};

export const getBlogWitoutCache = async ({
  slug,
}: {
  slug: InferSelectModel<typeof schema.blogs>['slug'];
}): Promise<Blog | undefined> => {
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
    return undefined;
  }

  return {
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    description: blog.description,
    tags: blog.blogTag.map((blogTag) => blogTag.tag.name),
    createdAt: blog.createdAt,
    updatedAt: blog.updatedAt,
  };
};

export const getBlogView = async ({
  blogId,
}: {
  blogId: InferSelectModel<typeof schema.blogViews>['blogId'];
}): Promise<number> => {
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
  )(blogId);
};

const increment = (column: AnyColumn, value = 1) => {
  return sql`${column} + ${value}`;
};

export const incrementBlogView = async ({
  slug,
}: {
  slug: InferSelectModel<typeof schema.blogs>['slug'];
}) => {
  const blog = await getBlog({ slug });

  if (!blog) {
    return;
  }

  return db
    .update(schema.blogViews)
    .set({
      views: increment(schema.blogViews.views),
    })
    .where(eq(schema.blogViews.blogId, blog.id));
};
