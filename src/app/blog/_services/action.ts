'use server';

import { db } from '#database/db';
import { comments } from '@/database/schema/comments';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import '@/libs/zod';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
});

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
  if (!comment || !feedbackId) {
    return {
      success: false,
      message: 'フィードバックの選択か、コメントの入力をしてください',
    };
  }

  if (comment.length > 500) {
    return {
      success: false,
      message: 'コメントは500文字以内で入力してください',
    };
  }

  const identifier = 'api';
  const { success } = await ratelimit.limit(identifier);

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
      message: '不明なエラーが発生しました',
    };
  }

  await db.insert(comments).values({
    message: comment,
    feedbackId: feedbackId,
  });

  return {
    success: true,
  };
};
