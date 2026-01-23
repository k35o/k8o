import { db } from '@repo/database';
import { compareDate } from '@repo/helpers/date/compare';
import { eq } from 'drizzle-orm';
import { z } from 'zod/mini';
import VerifyEmail from '@/emails/verify-email';
import { resend } from '@/services/email';
import type { Result } from '../type';

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
      .update(db._schema.subscribers)
      .set({
        verificationToken,
        // 2時間後に期限切れ
        tokenExpiresAt: tokenExpiresAt.toISOString(),
      })
      .where(eq(db._schema.subscribers.id, subscriber.id));
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
            console.error('Failed to send verification email via Resend:', {
              error,
              email,
              timestamp: new Date().toISOString(),
            });
            throw new Error('メールの送信に失敗しました');
          }
        });
    });
  } catch (error) {
    console.error('Failed to send verification email:', {
      error,
      email,
      subscriberId: subscriber.id,
      timestamp: new Date().toISOString(),
    });
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
        eq(db._schema.subscribers.email, email),
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
  if (!(subscriber.verificationToken && subscriber.tokenExpiresAt)) {
    return {
      success: false,
      message: '不正なトークンです。',
    };
  }
  if (
    subscriber.verificationToken !== token ||
    compareDate(new Date(subscriber.tokenExpiresAt), new Date()) === 'less'
  ) {
    return {
      success: false,
      message: '不正なトークンです。',
    };
  }
  try {
    await db
      .update(db._schema.subscribers)
      .set({
        isVerified: true,
        verificationToken: null,
        tokenExpiresAt: null,
      })
      .where(eq(db._schema.subscribers.id, subscriber.id));
    return {
      success: true,
      data: null,
    };
  } catch (error) {
    console.error('Failed to verify email:', {
      error,
      email,
      subscriberId: subscriber.id,
      timestamp: new Date().toISOString(),
    });
    return {
      success: false,
      message: '不明なエラーが発生しました。',
    };
  }
};
