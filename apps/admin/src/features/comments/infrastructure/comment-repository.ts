import { db } from '@repo/database';
import {
  count,
  countDistinct,
  desc,
  eq,
  inArray,
  like,
  type SQL,
} from 'drizzle-orm';

export type CommentRecord = {
  id: number;
  message: string | null;
  createdAt: string;
  feedbackName: string | null;
  blogSlug: string | null;
};

export type FindCommentsParams = {
  q?: string;
  page?: number;
  pageSize?: number;
};

export type FindCommentsResult = {
  items: CommentRecord[];
  total: number;
};

export type CommentStats = {
  total: number;
  blogLinked: number;
  unlinked: number;
};

const buildCommentWhere = (q: string | undefined): SQL | undefined =>
  q !== undefined && q !== ''
    ? like(db._schema.comments.message, `%${q}%`)
    : undefined;

// blog_comment.commentId に unique 制約が無く 1:N の可能性があるため、
// 一覧本体と blog 紐付けを別クエリで取得して JS でマージする。
export const findComments = async ({
  q,
  page = 1,
  pageSize = 20,
}: FindCommentsParams = {}): Promise<FindCommentsResult> => {
  const where = buildCommentWhere(q);

  const totalRow = await db
    .select({ value: count() })
    .from(db._schema.comments)
    .where(where);
  const total = totalRow[0]?.value ?? 0;

  const commentRows = await db
    .select({
      id: db._schema.comments.id,
      message: db._schema.comments.message,
      createdAt: db._schema.comments.createdAt,
      feedbackName: db._schema.feedbacks.name,
    })
    .from(db._schema.comments)
    .leftJoin(
      db._schema.feedbacks,
      eq(db._schema.comments.feedbackId, db._schema.feedbacks.id),
    )
    .where(where)
    .orderBy(desc(db._schema.comments.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  if (commentRows.length === 0) {
    return { items: [], total };
  }

  const commentIds = commentRows.map((row) => row.id);
  const blogLinks = await db
    .select({
      commentId: db._schema.blogComment.commentId,
      blogSlug: db._schema.blogs.slug,
    })
    .from(db._schema.blogComment)
    .innerJoin(
      db._schema.blogs,
      eq(db._schema.blogs.id, db._schema.blogComment.blogId),
    )
    .where(inArray(db._schema.blogComment.commentId, commentIds));

  const slugByCommentId = new Map<number, string>();
  for (const link of blogLinks) {
    if (!slugByCommentId.has(link.commentId)) {
      slugByCommentId.set(link.commentId, link.blogSlug);
    }
  }

  const items = commentRows.map((row) => ({
    id: row.id,
    message: row.message,
    createdAt: row.createdAt,
    feedbackName: row.feedbackName,
    blogSlug: slugByCommentId.get(row.id) ?? null,
  }));

  return { items, total };
};

export const findCommentStats = async (): Promise<CommentStats> => {
  const [total, blogLinked] = await Promise.all([
    db
      .select({ value: count() })
      .from(db._schema.comments)
      .then((r) => r[0]?.value ?? 0),
    db
      .select({ value: countDistinct(db._schema.blogComment.commentId) })
      .from(db._schema.blogComment)
      .then((r) => r[0]?.value ?? 0),
  ]);

  return {
    total,
    blogLinked,
    unlinked: total - blogLinked,
  };
};

// blog_comment は commentId にカスケード設定が無いため、
// 先に紐付け行を削除してから本体を削除する。
export const deleteCommentById = async (id: number): Promise<void> => {
  await db
    .delete(db._schema.blogComment)
    .where(eq(db._schema.blogComment.commentId, id));
  await db.delete(db._schema.comments).where(eq(db._schema.comments.id, id));
};
