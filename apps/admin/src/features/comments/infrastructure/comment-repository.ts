import { db } from '@repo/database';
import { and, desc, eq, inArray, isNull } from 'drizzle-orm';

export type ClaimedComment = {
  id: number;
};

export type CommentRecord = {
  id: number;
  message: string | null;
  createdAt: string;
  sentAt: string | null;
  feedbackName: string | null;
  blogSlug: string | null;
};

/**
 * 第三者から届いた問い合わせ・フィードバック一覧を取得する。
 * blog_comment.commentId に unique 制約が無く 1:N の可能性があるため、
 * 一覧本体と blog 紐付けを別クエリで取得して JS でマージする。
 */
export const findComments = async (limit = 200): Promise<CommentRecord[]> => {
  const commentRows = await db
    .select({
      id: db._schema.comments.id,
      message: db._schema.comments.message,
      createdAt: db._schema.comments.createdAt,
      sentAt: db._schema.comments.sentAt,
      feedbackName: db._schema.feedbacks.name,
    })
    .from(db._schema.comments)
    .leftJoin(
      db._schema.feedbacks,
      eq(db._schema.comments.feedbackId, db._schema.feedbacks.id),
    )
    .orderBy(desc(db._schema.comments.createdAt))
    .limit(limit);

  if (commentRows.length === 0) {
    return [];
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

  return commentRows.map((row) => ({
    id: row.id,
    message: row.message,
    createdAt: row.createdAt,
    sentAt: row.sentAt,
    feedbackName: row.feedbackName,
    blogSlug: slugByCommentId.get(row.id) ?? null,
  }));
};

export const claimUnsentComments = async (
  claimedAt: string,
): Promise<ClaimedComment[]> => {
  const comments = await db.transaction((tx) =>
    tx
      .update(db._schema.comments)
      .set({ sentAt: claimedAt })
      .where(isNull(db._schema.comments.sentAt))
      .returning({ id: db._schema.comments.id }),
  );
  return comments;
};

export const releaseClaimedComments = async (
  comments: ClaimedComment[],
  claimedAt: string,
): Promise<void> => {
  await db
    .update(db._schema.comments)
    .set({ sentAt: null })
    .where(
      and(
        inArray(
          db._schema.comments.id,
          comments.map((comment) => comment.id),
        ),
        eq(db._schema.comments.sentAt, claimedAt),
      ),
    )
    .execute();
};
