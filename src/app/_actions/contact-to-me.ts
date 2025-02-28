'use server';

import { db } from '#database/db';
import * as schema from '#src/database/schema.js';
import { z } from 'zod';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import '@/libs/zod';

const contactSchema = z.object({
  message: z.string().max(255).min(1),
});

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
});

type Result =
  | {
      success: null;
      defaultValue: '';
    }
  | {
      success: true;
      defaultValue: '';
    }
  | {
      success: false;
      message: string;
      defaultValue: string;
    };

export const contact = async (
  _previousState: Result,
  formData: FormData,
): Promise<Result> => {
  const date = new Date();
  const validatedFields = contactSchema.safeParse({
    message: formData.get('message'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      defaultValue: formData.get('message') as string,
      message:
        validatedFields.error.errors[0]?.message ??
        'お問い合わせ内容が不正です',
    };
  }

  const identifier = 'api';
  const { success } = await ratelimit.limit(identifier);

  if (!success) {
    return {
      success: false,
      message:
        'お問い合わせの送信回数が上限に達しました。数分後に再度お試しください。',
      defaultValue: formData.get('message') as string,
    };
  }

  await db.insert(schema.inquiry).values({
    message: validatedFields.data.message,
    sentAt: date,
  });

  return {
    success: true,
    defaultValue: '',
  };
};
