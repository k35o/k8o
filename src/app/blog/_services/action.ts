'use server';

import { db } from '#database/db';
import * as schema from '@/database/schema';
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
  feedbackId: number,
): Promise<Result> => {
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

  await db.insert(schema.blogFeedback).values({
    blogId: blog.id,
    feedbackId: feedbackId,
  });

  return {
    success: true,
  };
};
