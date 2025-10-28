import '@/libs/zod';

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
): Promise<Result> => {
  return Promise.resolve().then(() => ({
    success: true,
  }));
};
