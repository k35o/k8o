import { eq } from 'drizzle-orm';
import { db } from '#database/db';
import { blogViews } from '@/database/schema/blog-views';
import { increment } from '@/database/utils';

export const getBlogView = async (id: number): Promise<number> => {
  return await db.query.blogViews
    .findFirst({
      where: (blogViews, { eq }) => eq(blogViews.blogId, id),
    })
    .then((res) => res?.views ?? 0);
};

export const incrementBlogView = async (id: number) => {
  return await db
    .update(blogViews)
    .set({
      views: increment(blogViews.views),
    })
    .where(eq(blogViews.blogId, id));
};
