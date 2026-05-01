import { configureZod } from '@/shared/validation/zod';

configureZod();

type Result =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    };

export const feedback = (
  _slug: string,
  _feedbackId: number | null,
  _comment: string,
): Promise<Result> =>
  Promise.resolve().then(() => ({
    success: true,
  }));
