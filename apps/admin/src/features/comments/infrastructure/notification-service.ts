import { sendPushNotification } from '@/features/push-notification/infrastructure/push-notification';

const MAX_RETRY_ATTEMPTS = 3;
const INITIAL_BACKOFF_MS = 1000;
const BACKOFF_MULTIPLIER = 2;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

export const sendCommentNotificationWithRetry = async (
  title: string,
  body: string,
  url: string,
): Promise<void> => {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
    try {
      // oxlint-disable-next-line no-await-in-loop -- リトライロジックのため順次実行が必要
      await sendPushNotification(title, body, url);
      return;
    } catch (error) {
      lastError =
        error instanceof Error
          ? error
          : new Error('k8o-push API呼び出し中に不明なエラーが発生しました');

      if (attempt < MAX_RETRY_ATTEMPTS) {
        const backoffMs =
          INITIAL_BACKOFF_MS * BACKOFF_MULTIPLIER ** (attempt - 1);
        console.warn(
          `k8o-push API呼び出し失敗 (試行 ${attempt}/${MAX_RETRY_ATTEMPTS})。${backoffMs}ms後にリトライします。`,
          lastError.message,
        );
        // oxlint-disable-next-line no-await-in-loop -- リトライ間隔を順番に待つ必要がある
        await sleep(backoffMs);
      }
    }
  }

  throw (
    lastError ?? new Error('k8o-push API呼び出し中に不明なエラーが発生しました')
  );
};
