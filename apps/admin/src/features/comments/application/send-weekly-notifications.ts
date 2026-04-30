import {
  type ClaimedComment,
  claimUnsentComments,
  releaseClaimedComments,
} from '../infrastructure/comment-repository';
import { sendCommentNotificationWithRetry } from '../infrastructure/notification-service';

type WeeklyNotificationResult =
  | { ok: true; count: number }
  | {
      ok: false;
      error: {
        code: 'DATABASE_ERROR' | 'PUSH_NOTIFICATION_ERROR';
        message: string;
      };
    };

export const sendWeeklyCommentNotifications =
  async (): Promise<WeeklyNotificationResult> => {
    const claimedAt = new Date().toISOString();

    let claimed: ClaimedComment[];
    try {
      claimed = await claimUnsentComments(claimedAt);
    } catch (error) {
      console.error('未送信コメントの取得に失敗しました:', error);
      return {
        ok: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'データベース操作に失敗しました',
        },
      };
    }

    if (claimed.length === 0) {
      return { ok: true, count: 0 };
    }

    try {
      await sendCommentNotificationWithRetry(
        `週次レポート (${claimed.length}件)`,
        `お問い合わせが${claimed.length}件あります`,
        'https://www.k8o.me',
      );
      return { ok: true, count: claimed.length };
    } catch (error) {
      console.error('k8o-push API呼び出しに失敗しました:', error);
      try {
        await releaseClaimedComments(claimed, claimedAt);
      } catch (revertError) {
        console.error('sentAtフィールドの復帰に失敗しました:', {
          error: revertError,
          claimedAt,
          affectedIds: claimed.map((n) => n.id),
        });
      }
      return {
        ok: false,
        error: {
          code: 'PUSH_NOTIFICATION_ERROR',
          message: 'プッシュ通知の送信に失敗しました',
        },
      };
    }
  };
