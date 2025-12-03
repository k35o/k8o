'use server';

import { db } from '@repo/database';
import { ratelimit } from '@repo/helpers/ratelimit';
import { z } from 'zod';
import '@/libs/zod';

const contactSchema = z.object({
  message: z.string().max(255).min(1),
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
  const validatedFields = contactSchema.safeParse({
    message: formData.get('message'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      defaultValue: formData.get('message') as string,
      message:
        validatedFields.error.issues[0]?.message ??
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

  await db.insert(db._schema.comments).values({
    message: validatedFields.data.message,
  });

  return {
    success: true,
    defaultValue: '',
  };
};
