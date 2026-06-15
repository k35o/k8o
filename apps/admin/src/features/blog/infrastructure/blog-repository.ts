import { db } from '@repo/database';
import { and, count, desc, eq, inArray, like, type SQL } from 'drizzle-orm';

export type BlogStatus = 'all' | 'published' | 'draft';
export type BlogSort = 'recent' | 'views';

export type BlogRecord = {
  id: number;
  slug: string;
  published: boolean;
  createdAt: string;
  views: number;
  commentCount: number;
  tags: string[];
};

export type FindBlogsParams = {
  q?: string;
  status?: BlogStatus;
  sort?: BlogSort;
  page?: number;
  pageSize?: number;
};

export type FindBlogsResult = {
  items: BlogRecord[];
  total: number;
};

export type TopBlog = {
  slug: string;
  views: number;
  published: boolean;
};

const buildBlogWhere = (
  status: BlogStatus,
  q: string | undefined,
): SQL | undefined => {
  const conditions: SQL[] = [];
  if (status === 'published') {
    conditions.push(eq(db._schema.blogs.published, true));
  } else if (status === 'draft') {
    conditions.push(eq(db._schema.blogs.published, false));
  }
  if (q !== undefined && q !== '') {
    conditions.push(like(db._schema.blogs.slug, `%${q}%`));
  }
  if (conditions.length === 0) {
    return undefined;
  }
  return and(...conditions);
};

export const findBlogs = async ({
  q,
  status = 'all',
  sort = 'recent',
  page = 1,
  pageSize = 20,
}: FindBlogsParams = {}): Promise<FindBlogsResult> => {
  const where = buildBlogWhere(status, q);

  const totalRow = await db
    .select({ value: count() })
    .from(db._schema.blogs)
    .where(where);
  const total = totalRow[0]?.value ?? 0;

  const orderBy =
    sort === 'views'
      ? desc(db._schema.blogViews.views)
      : desc(db._schema.blogs.createdAt);

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
    .orderBy(orderBy)
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  if (rows.length === 0) {
    return { items: [], total };
  }

  const ids = rows.map((row) => row.id);

  const [commentCounts, tagRows] = await Promise.all([
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

  const commentMap = new Map(commentCounts.map((c) => [c.blogId, c.value]));
  const tagMap = new Map<number, string[]>();
  for (const row of tagRows) {
    const list = tagMap.get(row.blogId) ?? [];
    list.push(row.name);
    tagMap.set(row.blogId, list);
  }

  const items = rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    published: row.published,
    createdAt: row.createdAt,
    views: row.views ?? 0,
    commentCount: commentMap.get(row.id) ?? 0,
    tags: tagMap.get(row.id) ?? [],
  }));

  return { items, total };
};

export const findTopViewedBlogs = async (limit = 5): Promise<TopBlog[]> => {
  const rows = await db
    .select({
      slug: db._schema.blogs.slug,
      views: db._schema.blogViews.views,
      published: db._schema.blogs.published,
    })
    .from(db._schema.blogs)
    .innerJoin(
      db._schema.blogViews,
      eq(db._schema.blogViews.blogId, db._schema.blogs.id),
    )
    .orderBy(desc(db._schema.blogViews.views))
    .limit(limit);

  return rows.map((row) => ({
    slug: row.slug,
    views: row.views,
    published: row.published,
  }));
};

export const updateBlogPublished = async (
  id: number,
  published: boolean,
): Promise<void> => {
  await db
    .update(db._schema.blogs)
    .set({ published })
    .where(eq(db._schema.blogs.id, id));
};
