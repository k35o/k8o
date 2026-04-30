import { db } from '@repo/database';

type Result =
  | {
      success: true;
      defaultValue: '';
    }
  | {
      success: false;
      message: string;
      defaultValue: string;
    };

export const submitContact = async (message: string): Promise<Result> => {
  try {
    await db.insert(db._schema.comments).values({
      message,
    });

    return {
      success: true,
      defaultValue: '',
    };
  } catch (error) {
    console.error('Failed to insert contact comment:', {
      error,
      messageLength: message.length,
      timestamp: new Date().toISOString(),
    });

    return {
      success: false,
      message:
        'お問い合わせの送信に失敗しました。しばらくしてから再度お試しください。',
      defaultValue: message,
    };
  }
};
