'use server';

import { configureZod } from '@/shared/validation/zod';

import { submitFeedback } from '../application/submit-feedback';

configureZod();

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
  if (comment === '' && feedbackId === null) {
    return {
      success: false,
      message: 'コメントまたはフィードバックIDのいずれかを入力してください',
    };
  }

  if (comment.length > 500) {
    return {
      success: false,
      message: 'コメントは500文字以内で入力してください',
    };
  }

  const result = await submitFeedback(slug, feedbackId, comment);
  return result;
};
