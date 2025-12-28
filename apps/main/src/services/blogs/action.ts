'use server';

import { db } from '@repo/database';
import '@/libs/zod';

type Result =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    };

export const feedback = async (
  slug: string,
  feedbackId: number | null,
  comment: string,
): Promise<Result> => {
  if (!(comment || feedbackId)) {
    return {
      success: false,
      message: 'コメントまたはフィードバックIDのいずれかを入力してください',
    };
  }

  if (comment.length > 500) {
    return {
      success: false,
      message: 'コメントは500文字以内で入力してください',
    };
  }

  const blog = await db.query.blogs.findFirst({
    where: (blogs, { eq }) => eq(blogs.slug, slug),
  });
  if (!blog) {
    return {
      success: false,
      message: '指定されたブログが見つかりません',
    };
  }

  try {
    const insertComments = await db
      .insert(db._schema.comments)
      .values({
        message: comment,
        feedbackId,
      })
      .returning({ insertedId: db._schema.comments.id });

    if (insertComments[0]?.insertedId !== undefined) {
      await db.insert(db._schema.blogComment).values({
        blogId: blog.id,
        commentId: insertComments[0].insertedId,
      });
    }

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
