'use server';

import * as z from 'zod/mini';

import { configureZod } from '@/shared/validation/zod';

import { submitFeedback } from '../application/submit-feedback';

configureZod();

// Server Action は任意のクライアントから任意のシリアライズ値で呼べるため、
// 型（comment が文字列か等）を trust boundary として検証する。文字数・組み合わせ
// といった業務ルールは下の個別チェックでユーザー向けメッセージを保つ。
const feedbackSchema = z.object({
  slug: z.string().check(z.minLength(1), z.maxLength(200)),
  feedbackId: z.nullable(z.number().check(z.int(), z.positive())),
  comment: z.string(),
});

type Result =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    };

export const feedback = async (
  slug: string,
  feedbackId: number | null,
  comment: string,
): Promise<Result> => {
  const validated = feedbackSchema.safeParse({ slug, feedbackId, comment });
  if (!validated.success) {
    return {
      success: false,
      message:
        validated.error.issues[0]?.message ?? '入力内容が正しくありません',
    };
  }

  if (validated.data.comment === '' && validated.data.feedbackId === null) {
    return {
      success: false,
      message: 'コメントまたはフィードバックIDのいずれかを入力してください',
    };
  }

  if (validated.data.comment.length > 500) {
    return {
      success: false,
      message: 'コメントは500文字以内で入力してください',
    };
  }

  const result = await submitFeedback(
    validated.data.slug,
    validated.data.feedbackId,
    validated.data.comment,
  );
  return result;
};
