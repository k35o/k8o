import { db } from '@repo/database';
import { and, eq } from '@repo/database/orm';

export const findPublishedBlogId = async (
  slug: string,
): Promise<number | null> => {
  const blog = await db.query.blogs.findFirst({
    columns: { id: true },
    where: and(
      eq(db._schema.blogs.slug, slug),
      eq(db._schema.blogs.published, true),
    ),
  });
  return blog?.id ?? null;
};

// 累計の行が無くても insert で作り直すので、計測が抜けない
export const incrementBlogView = async (blogId: number): Promise<void> => {
  await db
    .insert(db._schema.blogViews)
    .values({ blogId, views: 1 })
    .onConflictDoUpdate({
      target: db._schema.blogViews.blogId,
      set: { views: db._utils.increment(db._schema.blogViews.views) },
    });
};

export const incrementBlogViewDaily = async (
  blogId: number,
  date: string,
): Promise<void> => {
  await db
    .insert(db._schema.blogViewDailies)
    .values({ blogId, date, views: 1 })
    .onConflictDoUpdate({
      target: [
        db._schema.blogViewDailies.blogId,
        db._schema.blogViewDailies.date,
      ],
      set: { views: db._utils.increment(db._schema.blogViewDailies.views) },
    });
};
