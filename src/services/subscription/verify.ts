import { Result } from '../type';
import { db } from '#database/db';
import { subscribers } from '@/database/schema/subscribers';
import VerifyEmail from '@/emails/verify-email';
import { resend } from '@/services/email';
import { compareDate } from '@/utils/date/compare';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

export const sendVerificationEmail = async (
  email: string,
): Promise<void> => {
  if (!z.string().email().safeParse(email).success) {
    return;
  }
  const subscriber = await db.query.subscribers.findFirst({
    columns: {
      id: true,
      isVerified: true,
      verificationToken: true,
      tokenExpiresAt: true,
    },
    where: (subscribers, { eq }) => eq(subscribers.email, email),
  });
  if (!subscriber) {
    return;
  }
  if (subscriber.isVerified) {
    return;
  }
  if (!subscriber.tokenExpiresAt || !subscriber.verificationToken) {
    return;
  }
  if (compareDate(subscriber.tokenExpiresAt, new Date()) === 'less') {
    return;
  }
  try {
    await db
      .update(subscribers)
      .set({
        verificationToken: crypto.randomUUID(),
        // 2時間後に期限切れ
        tokenExpiresAt: new Date(Date.now() + 1000 * 2 * 60 * 60),
      })
      .where(eq(subscribers.id, subscriber.id));
    const { error } = await resend.emails.send({
      from: 'notifications@k8o.me',
      to: email,
      subject: 'メールアドレスの確認',
      react: VerifyEmail({
        email,
        token: subscriber.verificationToken,
        expiresAt: subscriber.tokenExpiresAt,
      }),
    });
    if (error) {
      console.log(error);
      throw new Error('メールの送信に失敗しました');
    }
  } catch (error) {
    console.log(error);
  }
};

export const verifyEmail = async (
  email: string,
  token: string,
): Promise<Result<null>> => {
  if (!z.string().email().safeParse(email).success) {
    return {
      success: false,
      message: 'メールアドレスが不正です',
    };
  }
  const subscriber = await db.query.subscribers.findFirst({
    columns: {
      id: true,
      verificationToken: true,
      tokenExpiresAt: true,
    },
    where: (subscribers, { eq, and }) =>
      and(
        eq(subscribers.email, email),
        eq(subscribers.isVerified, false),
      ),
  });
  if (!subscriber) {
    return {
      success: false,
      // isVerifiedなメールアドレスであることを教えないようにする
      message: '登録されていないメールアドレスです',
    };
  }
  if (!subscriber.verificationToken || !subscriber.tokenExpiresAt) {
    return {
      success: false,
      message: 'トークンが不正です',
    };
  }
  if (
    subscriber.verificationToken !== token ||
    compareDate(subscriber.tokenExpiresAt, new Date()) === 'less'
  ) {
    return {
      success: false,
      message: 'トークンが不正です',
    };
  }
  try {
    await db
      .update(subscribers)
      .set({
        isVerified: true,
        verificationToken: null,
        tokenExpiresAt: null,
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
