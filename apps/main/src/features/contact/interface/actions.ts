'use server';

import * as z from 'zod/mini';
import { submitContact } from '../application/submit-contact';
import '@/shared/validation/zod';

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

  return await submitContact(validatedFields.data.message);
};
