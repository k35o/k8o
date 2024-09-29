'use server';

import { db } from '@/drizzle/db';
import * as schema from '@/drizzle/schema';
import { AnyColumn, eq, InferSelectModel, sql } from 'drizzle-orm';
import { unstable_cache as cache } from 'next/cache';

export const getBlog = async ({
  slug,
}: {
  slug: InferSelectModel<typeof schema.blogs>['slug'];
}) => {
  return cache(
    async (slug: string) =>
      db.query.blogs.findFirst({
        where: (blog, { eq }) => eq(blog.slug, slug),
      }),
    ['blog'],
  )(slug);
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
  blogId,
}: {
  blogId: InferSelectModel<typeof schema.blogViews>['blogId'];
}) => {
  return db
    .update(schema.blogViews)
    .set({
      views: increment(schema.blogViews.views),
    })
    .where(eq(schema.blogViews.blogId, blogId));
};
