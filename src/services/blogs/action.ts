'use server';

import { db } from '#database/db';
import { blogComment } from '@/database/schema/blog-comment';
import { comments } from '@/database/schema/comments';
import {
  FeedbackValidationError,
  RateLimitError,
  BlogNotFoundError,
} from '@/utils/errors/custom-errors';
import { checkRateLimit, RateLimitType } from '@/utils/ratelimit';
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
  try {
    if (!comment && !feedbackId) {
      throw new FeedbackValidationError(
        'フィードバックの選択か、コメントの入力をしてください',
      );
    }

    if (comment.length > 500) {
      throw new FeedbackValidationError(
        'コメントは500文字以内で入力してください',
      );
    }

    const { success } = await checkRateLimit(
      'feedback',
      RateLimitType.FEEDBACK,
    );

    if (!success) {
      throw new RateLimitError();
    }

    const blog = await db.query.blogs.findFirst({
      where: (blogs, { eq }) => eq(blogs.slug, slug),
    });
    if (!blog) {
      throw new BlogNotFoundError(slug);
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
  } catch (error) {
    if (
      error instanceof FeedbackValidationError ||
      error instanceof RateLimitError
    ) {
      return {
        success: false,
        message: error.userMessage,
      };
    }

    if (error instanceof BlogNotFoundError) {
      return {
        success: false,
        message: '不明なエラーが発生しました',
      };
    }

    // 予期しないエラーの場合
    console.error('Unexpected error in feedback:', error);
    return {
      success: false,
      message: 'システムエラーが発生しました',
    };
  }
};
