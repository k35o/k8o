'use server';

import { db } from '#drizzle/db';
import * as schema from '@/drizzle/schema';
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

  await db.insert(schema.inquiry).values({
    message: validatedFields.data.message,
    sentAt: date,
  });

  return {
    success: true,
    defaultValue: '',
  };
};
