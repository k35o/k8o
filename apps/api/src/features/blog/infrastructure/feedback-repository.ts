import { db } from '@repo/database';

export const insertBlogFeedback = async ({
  blogId,
  feedbackId,
  message,
}: {
  blogId: number;
  feedbackId: number | null;
  message: string | null;
}): Promise<void> => {
  // コメントと記事への紐付けは一緒に入れる。途中で失敗して記事に紐付かないコメントが
  // 残ると、お問い合わせと区別できなくなる
  await db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(db._schema.comments)
      .values({ message, feedbackId })
      .returning({ id: db._schema.comments.id });
    if (inserted === undefined) {
      throw new Error('コメントの ID を取得できませんでした');
    }
    await tx
      .insert(db._schema.blogComment)
      .values({ blogId, commentId: inserted.id });
  });
};
