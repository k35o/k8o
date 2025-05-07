'use server';

import { after } from '#next/server';
import { subscribe } from '@/services/subscriptions/subscribe';

export const registerEmail = async (
  _: unknown,
  formData: FormData,
) => {
  const email = formData.get('email') as string | null;

  if (!email) {
    return {
      success: false,
      message: 'メールアドレスを入力してください',
    };
  }

  const result = await subscribe(email, after);

  if (result.success) {
    return {
      success: true,
    };
  }
  return {
    success: false,
    message: result.message,
  };
};
