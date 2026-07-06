import { db } from '@repo/database';

type Result =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    };

export const submitFeedback = async (
  slug: string,
  feedbackId: number | null,
  comment: string,
): Promise<Result> => {
  const blog = await db.query.blogs.findFirst({
    where: (blogs, { eq }) => eq(blogs.slug, slug),
  });
  if (blog === undefined) {
    return {
      success: false,
      message: '指定されたブログが見つかりません',
    };
  }

  try {
    // コメント本体と blog 紐付けは原子的に入れる。途中失敗で「blog に紐付かない
    // 孤児コメント」（お問い合わせと区別できない）が残らないよう transaction で囲う。
    await db.transaction(async (tx) => {
      const insertComments = await tx
        .insert(db._schema.comments)
        .values({
          message: comment,
          feedbackId,
        })
        .returning({ insertedId: db._schema.comments.id });

      const insertedId = insertComments[0]?.insertedId;
      if (insertedId === undefined) {
        throw new Error('コメントIDの取得に失敗しました');
      }

      await tx.insert(db._schema.blogComment).values({
        blogId: blog.id,
        commentId: insertedId,
      });
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('Failed to insert blog feedback:', {
      error,
      slug,
      blogId: blog.id,
      commentLength: comment.length,
      feedbackId,
      timestamp: new Date().toISOString(),
    });

    return {
      success: false,
      message:
        'フィードバックの送信に失敗しました。しばらくしてから再度お試しください。',
    };
  }
};
