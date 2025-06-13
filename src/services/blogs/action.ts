'use server';

import { db } from '#database/db';
import { blogComment } from '@/database/schema/blog-comment';
import { comments } from '@/database/schema/comments';
import { checkRateLimit, RateLimitType } from '@/helpers/ratelimit';
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
  if (!comment && !feedbackId) {
    return {
      success: false,
      message:
        'コメントまたはフィードバックIDのいずれかを入力してください',
    };
  }

  if (comment.length > 500) {
    return {
      success: false,
      message: 'コメントは500文字以内で入力してください',
    };
  }

  const { success } = await checkRateLimit(
    'feedback',
    RateLimitType.FEEDBACK,
  );

  if (!success) {
    return {
      success: false,
      message:
        '送信回数が上限に達しました。数分後に再度お試しください。',
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

  const insertComments = await db
    .insert(comments)
    .values({
      message: comment,
      feedbackId: feedbackId,
    })
    .returning({ insertedId: comments.id });

  if (insertComments[0]?.insertedId !== undefined) {
    await db.insert(blogComment).values({
      blogId: blog.id,
      commentId: insertComments[0].insertedId,
    });
  }

  return {
    success: true,
  };
};
