import { db } from '@repo/database';
import { and, eq, inArray, isNull } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { sendPushNotification } from '@/services/push-notification/push-notification';

type UnsentComment = {
  id: number;
};

const MAX_RETRY_ATTEMPTS = 3;
const INITIAL_BACKOFF_MS = 1000;
const BACKOFF_MULTIPLIER = 2;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function sendWithRetry(
  title: string,
  body: string,
  url: string,
): Promise<void> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
    try {
      // biome-ignore lint/performance/noAwaitInLoops: リトライロジックのため順次実行が必要
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
        await sleep(backoffMs);
      }
    }
  }

  throw lastError;
}

export async function GET(req: NextRequest) {
  if (
    req.headers.get('Authorization') !== `Bearer ${process.env['CRON_SECRET']}`
  ) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const claimedAt = new Date().toISOString();

  let claimed: UnsentComment[];
  try {
    claimed = await db.transaction((tx) => {
      return tx
        .update(db._schema.comments)
        .set({ sentAt: claimedAt })
        .where(isNull(db._schema.comments.sentAt))
        .returning({ id: db._schema.comments.id });
    });
  } catch (error) {
    console.error('未送信コメントの取得に失敗しました:', error);
    return NextResponse.json(
      { ok: false, error: 'データベース操作に失敗しました' },
      { status: 500 },
    );
  }

  const notifications: UnsentComment[] = claimed;

  if (notifications.length === 0) {
    return NextResponse.json({ ok: true });
  }

  try {
    await sendWithRetry(
      `週次レポート (${notifications.length}件)`,
      `お問い合わせが${notifications.length}件あります`,
      'https://www.k8o.me',
    );
  } catch (error) {
    console.error(
      `k8o-push API呼び出しが${MAX_RETRY_ATTEMPTS}回失敗しました:`,
      error,
    );
    try {
      await db
        .update(db._schema.comments)
        .set({ sentAt: null })
        .where(
          and(
            inArray(
              db._schema.comments.id,
              notifications.map((n) => n.id),
            ),
            eq(db._schema.comments.sentAt, claimedAt),
          ),
        )
        .execute();
    } catch (revertError) {
      console.error('sentAtフィールドの復帰に失敗しました:', {
        error: revertError,
        claimedAt,
        affectedIds: notifications.map((n) => n.id),
      });
    }
    return NextResponse.json(
      { ok: false, error: 'プッシュ通知の送信に失敗しました' },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
