import { db } from '@repo/database';
import { eq } from 'drizzle-orm';

export const getBlogView = (id: number): Promise<number> =>
  db.query.blogViews
    .findFirst({
      where: (blogViews, { eq: equals }) => equals(blogViews.blogId, id),
    })
    .then((res) => res?.views ?? 0);

export const incrementBlogView = (id: number) =>
  db
    .update(db._schema.blogViews)
    .set({
      views: db._utils.increment(db._schema.blogViews.views),
    })
    .where(eq(db._schema.blogViews.blogId, id));
