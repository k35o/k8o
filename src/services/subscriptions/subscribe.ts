import { Result } from '../type';
import { db } from '#database/db';
import { subscribers } from '@/database/schema/subscribers';
import { sendVerificationEmail } from '@/services/subscriptions/verify';
import { z } from 'zod/v4';

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
    await db.insert(subscribers).values({
      email,
    });
    await sendVerificationEmail(email, waitUntilResend);
    return {
      success: true,
      data: null,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: '登録に失敗しました',
    };
  }
};
