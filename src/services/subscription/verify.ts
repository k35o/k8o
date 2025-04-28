import { randomUUID } from 'crypto';
import { Result } from '../type';
import { db } from '#database/db';
import { subscribers } from '#src/database/schema/subscribers.js';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

export const sendVerificationEmail = async (
  email: string,
): Promise<Result<null>> => {
  if (!z.string().email().safeParse(email).success) {
    return {
      success: false,
      message: 'メールアドレスが不正です',
    };
  }
  const subscriber = await db.query.subscribers.findFirst({
    columns: { id: true, isVerified: true },
    where: (subscribers, { eq }) => eq(subscribers.email, email),
  });
  if (!subscriber) {
    return {
      success: false,
      message: '登録されていないメールアドレスです',
    };
  }
  if (subscriber.isVerified) {
    return {
      success: false,
      message: 'すでに登録済みのメールアドレスです',
    };
  }
  const token = randomUUID();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);
  try {
    await db
      .update(subscribers)
      .set({
        isVerified: true,
        verificationToken: token,
        tokenExpiresAt: expiresAt,
      })
      .where(eq(subscribers.id, subscriber.id));
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
