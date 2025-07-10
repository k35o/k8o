import { Result } from '../type';
import { db } from '#database/db';
import { subscribers } from '@/database/schema/subscribers';
import VerifyEmail from '@/emails/verify-email';
import { resend } from '@/services/email';
import { compareDate } from '@k8o/helpers/date';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

export const sendVerificationEmail = async (
  email: string,
  waitUntilResend: (task: () => void) => void = (cb) => {
    cb();
  },
): Promise<void> => {
  if (!z.email().safeParse(email).success) {
    return;
  }
  const subscriber = await db.query.subscribers.findFirst({
    columns: {
      id: true,
      isVerified: true,
    },
    where: (subscribers, { eq }) => eq(subscribers.email, email),
  });
  if (!subscriber) {
    return;
  }
  if (subscriber.isVerified) {
    return;
  }
  try {
    const verificationToken = crypto.randomUUID();
    const tokenExpiresAt = new Date(Date.now() + 1000 * 2 * 60 * 60);
    await db
      .update(subscribers)
      .set({
        verificationToken,
        // 2時間後に期限切れ
        tokenExpiresAt,
      })
      .where(eq(subscribers.id, subscriber.id));
    waitUntilResend(() => {
      void resend()
        .emails.send({
          from: 'notifications@k8o.me',
          to: email,
          subject: 'メールアドレス確認のお願い',
          react: VerifyEmail({
            email,
            token: verificationToken,
            expiresAt: tokenExpiresAt,
          }),
        })
        .then((res) => {
          const { error } = res;
          if (error) {
            console.log(error);
            throw new Error('メールの送信に失敗しました');
          }
        });
    });
  } catch (error) {
    console.log(error);
  }
};

export const verifyEmail = async (
  email: string,
  token: string,
): Promise<Result<null>> => {
  if (!z.email().safeParse(email).success) {
    return {
      success: false,
      message: '不正なメールアドレスです。',
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
      message: '不正なトークンです。',
    };
  }
  if (
    subscriber.verificationToken !== token ||
    compareDate(subscriber.tokenExpiresAt, new Date()) === 'less'
  ) {
    return {
      success: false,
      message: '不正なトークンです。',
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
      message: '不明なエラーが発生しました。',
    };
  }
};
