'use server';

import { db } from '@repo/database';
import * as z from 'zod/mini';
import '@/libs/zod';

const contactSchema = z.object({
  message: z.string().check(z.minLength(1), z.maxLength(255)),
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

  try {
    await db.insert(db._schema.comments).values({
      message: validatedFields.data.message,
    });

    return {
      success: true,
      defaultValue: '',
    };
  } catch (error) {
    console.error('Failed to insert contact comment:', {
      error,
      messageLength: validatedFields.data.message.length,
      timestamp: new Date().toISOString(),
    });

    return {
      success: false,
      message:
        'お問い合わせの送信に失敗しました。しばらくしてから再度お試しください。',
      defaultValue: formData.get('message') as string,
    };
  }
};
