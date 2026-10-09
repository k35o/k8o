import { db } from '@repo/database';
import { count, desc, eq, inArray } from '@repo/database/orm';
import type { SQL } from '@repo/database/orm';

type BlogStatus = 'all' | 'published' | 'draft';
type BlogSort = 'recent' | 'views';

type BlogRecord = {
  slug: string;
  published: boolean;
  createdAt: string;
  views: number;
  feedbackCount: number;
  tags: string[];
};

type FindBlogsResult = {
  items: BlogRecord[];
  total: number;
};

const buildStatusWhere = (status: BlogStatus): SQL | undefined => {
  if (status === 'published') {
    return eq(db._schema.blogs.published, true);
  }
  if (status === 'draft') {
    return eq(db._schema.blogs.published, false);
  }
  return undefined;
};

export const findBlogs = async ({
  status,
  sort,
  page,
  pageSize,
}: {
  status: BlogStatus;
  sort: BlogSort;
  page: number;
  pageSize: number;
}): Promise<FindBlogsResult> => {
  const where = buildStatusWhere(status);

  const totalRow = await db
    .select({ value: count() })
    .from(db._schema.blogs)
    .where(where);
  const total = totalRow[0]?.value ?? 0;

  const rows = await db
    .select({
      id: db._schema.blogs.id,
      slug: db._schema.blogs.slug,
      published: db._schema.blogs.published,
      createdAt: db._schema.blogs.createdAt,
      views: db._schema.blogViews.views,
    })
    .from(db._schema.blogs)
    .leftJoin(
      db._schema.blogViews,
      eq(db._schema.blogViews.blogId, db._schema.blogs.id),
    )
    .where(where)
    // created_at / views は seed で重複するため、一意な id を tiebreaker に足して
    // ページ境界での行の重複・欠落を防ぐ。
    .orderBy(
      sort === 'views'
        ? desc(db._schema.blogViews.views)
        : desc(db._schema.blogs.createdAt),
      desc(db._schema.blogs.id),
    )
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  if (rows.length === 0) {
    return { items: [], total };
  }

  const ids = rows.map((row) => row.id);
  const [feedbackCounts, tagRows] = await Promise.all([
    db
      .select({ blogId: db._schema.blogComment.blogId, value: count() })
      .from(db._schema.blogComment)
      .where(inArray(db._schema.blogComment.blogId, ids))
      .groupBy(db._schema.blogComment.blogId),
    db
      .select({ blogId: db._schema.blogTag.blogId, name: db._schema.tags.name })
      .from(db._schema.blogTag)
      .innerJoin(
        db._schema.tags,
        eq(db._schema.tags.id, db._schema.blogTag.tagId),
      )
      .where(inArray(db._schema.blogTag.blogId, ids)),
  ]);

  const feedbackCountByBlogId = new Map(
    feedbackCounts.map((row) => [row.blogId, row.value]),
  );
  const tagsByBlogId = new Map<number, string[]>();
  for (const row of tagRows) {
    tagsByBlogId.set(row.blogId, [
      ...(tagsByBlogId.get(row.blogId) ?? []),
      row.name,
    ]);
  }

  return {
    items: rows.map((row) => ({
      slug: row.slug,
      published: row.published,
      createdAt: row.createdAt,
      views: row.views ?? 0,
      feedbackCount: feedbackCountByBlogId.get(row.id) ?? 0,
      tags: tagsByBlogId.get(row.id) ?? [],
    })),
    total,
  };
};

export const updateBlogPublishedBySlug = async (
  slug: string,
  published: boolean,
): Promise<boolean> => {
  const updated = await db
    .update(db._schema.blogs)
    .set({ published })
    .where(eq(db._schema.blogs.slug, slug))
    .returning({ id: db._schema.blogs.id });
  return updated.length > 0;
};
