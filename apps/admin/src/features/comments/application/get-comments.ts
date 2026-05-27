import { db } from '@repo/database';
import { desc, eq } from 'drizzle-orm';

export type CommentItem = {
  id: number;
  message: string | null;
  createdAt: string;
  sentAt: string | null;
  feedbackName: string | null;
  blogSlug: string | null;
};

/**
 * 第三者から届いた問い合わせ・フィードバックを取得する。
 * blog_comment 経由でブログ記事に紐づいている場合は slug も返す。
 */
export const getComments = async (): Promise<CommentItem[]> => {
  const rows = await db
    .select({
      id: db._schema.comments.id,
      message: db._schema.comments.message,
      createdAt: db._schema.comments.createdAt,
      sentAt: db._schema.comments.sentAt,
      feedbackName: db._schema.feedbacks.name,
      blogSlug: db._schema.blogs.slug,
    })
    .from(db._schema.comments)
    .leftJoin(
      db._schema.feedbacks,
      eq(db._schema.comments.feedbackId, db._schema.feedbacks.id),
    )
    .leftJoin(
      db._schema.blogComment,
      eq(db._schema.blogComment.commentId, db._schema.comments.id),
    )
    .leftJoin(
      db._schema.blogs,
      eq(db._schema.blogs.id, db._schema.blogComment.blogId),
    )
    .orderBy(desc(db._schema.comments.createdAt))
    .limit(200);

  return rows;
};
