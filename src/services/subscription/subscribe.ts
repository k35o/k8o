import { Result } from '../type';
import { sendVerificationEmail } from './verify';
import { db } from '#database/db';
import { subscribers } from '@/database/schema/subscribers';
import { compareDate } from '@/utils/date/compare';
import { z } from 'zod';

export const subscribe = async (
  email: string,
): Promise<Result<null>> => {
  if (!z.string().email().safeParse(email).success) {
    return {
      success: false,
      message: 'メールアドレスが不正です',
    };
  }
  const subscriber = await db.query.subscribers.findFirst({
    columns: { id: true, isVerified: true, tokenExpiresAt: true },
    where: (subscribers, { eq }) => eq(subscribers.email, email),
  });

  if (subscriber) {
    if (subscriber.isVerified) {
      return {
        success: false,
        message: 'すでに登録済みのメールアドレスです',
      };
    }
    if (
      subscriber.tokenExpiresAt &&
      compareDate(subscriber.tokenExpiresAt, new Date()) === 'less'
    ) {
      await sendVerificationEmail(email);
      return {
        success: true,
        data: null,
      };
    }
  }

  try {
    await db.insert(subscribers).values({
      email,
    });
    await sendVerificationEmail(email);
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
