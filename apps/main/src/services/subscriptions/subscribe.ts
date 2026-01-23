import { db } from '@repo/database';
import * as z from 'zod/mini';
import { sendVerificationEmail } from '@/services/subscriptions/verify';
import type { Result } from '../type';

export const subscribe = async (
  email: string,
  waitUntilResend: (task: () => void) => void = (cb) => {
    cb();
  },
): Promise<Result<null>> => {
  if (!z.email().safeParse(email).success) {
    return {
      success: false,
      message: 'メールアドレスが不正です',
    };
  }
  const subscriber = await db.query.subscribers.findFirst({
    columns: { id: true, isVerified: true },
    where: (subscribers, { eq }) => eq(subscribers.email, email),
  });

  if (subscriber) {
    if (subscriber.isVerified) {
      // すでに登録済みなので何もしない
      // 登録済みと悟られないように送信完了を装う
      return {
        success: true,
        data: null,
      };
    }
    // 認証済みでなければ再度招待メールを送る
    await sendVerificationEmail(email, waitUntilResend);
    return {
      success: true,
      data: null,
    };
  }

  try {
    await db.insert(db._schema.subscribers).values({
      email,
    });
    await sendVerificationEmail(email, waitUntilResend);
    return {
      success: true,
      data: null,
    };
  } catch (error) {
    console.error('Failed to insert subscriber:', {
      error,
      timestamp: new Date().toISOString(),
    });
    return {
      success: false,
      message: '登録に失敗しました',
    };
  }
};
