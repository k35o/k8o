import { db } from '@repo/database';
import { eq } from 'drizzle-orm';

export const getBlogView = async (id: number): Promise<number> =>
  db.query.blogViews
    .findFirst({
      where: (blogViews, { eq }) => eq(blogViews.blogId, id),
    })
    .then((res) => res?.views ?? 0);

export const incrementBlogView = async (id: number) =>
  db
    .update(db._schema.blogViews)
    .set({
      views: db._utils.increment(db._schema.blogViews.views),
    })
    .where(eq(db._schema.blogViews.blogId, id));
