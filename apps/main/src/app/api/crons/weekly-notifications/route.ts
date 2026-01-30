import { db } from '@repo/database';
import { inArray, isNull } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// 環境変数のバリデーション
const envSchema = z.object({
  CRON_SECRET: z.string().min(1, 'CRON_SECRET is required'),
  K8O_PUSH_API_KEY: z.string().min(1, 'K8O_PUSH_API_KEY is required'),
});

type UnsentComment = {
  id: number;
};

// リトライ設定
const MAX_RETRY_ATTEMPTS = 3;
const INITIAL_BACKOFF_MS = 1000;
const BACKOFF_MULTIPLIER = 2;

// Sleep関数
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// リトライ付きでk8o-push APIを呼び出す
async function sendPushNotificationWithRetry(
  apiKey: string,
  title: string,
  body: string,
  url: string,
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
    try {
      // biome-ignore lint/performance/noAwaitInLoops: リトライロジックのため順次実行が必要
      const response = await fetch('https://api.push.k8o.me/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify({ title, body, url }),
      });

      if (response.ok) {
        return response;
      }

      const errorText = await response.text();
      lastError = new Error(
        `k8o-push APIエラー (${response.status}): ${errorText}`,
      );

      if (attempt < MAX_RETRY_ATTEMPTS) {
        const backoffMs =
          INITIAL_BACKOFF_MS * BACKOFF_MULTIPLIER ** (attempt - 1);
        console.warn(
          `k8o-push API呼び出し失敗 (試行 ${attempt}/${MAX_RETRY_ATTEMPTS})。${backoffMs}ms後にリトライします。`,
          lastError.message,
        );
        await sleep(backoffMs);
      }
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
  // 環境変数のバリデーション
  const envResult = envSchema.safeParse({
    CRON_SECRET: process.env['CRON_SECRET'],
    K8O_PUSH_API_KEY: process.env['K8O_PUSH_API_KEY'],
  });

  if (!envResult.success) {
    console.error('環境変数が不正です:', envResult.error);
    return NextResponse.json(
      { ok: false, error: '環境変数が設定されていません' },
      { status: 500 },
    );
  }

  const { CRON_SECRET, K8O_PUSH_API_KEY } = envResult.data;

  // 認証チェック
  if (req.headers.get('Authorization') !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  // 並行実行時の重複送信を避けるため、未送信レコードを先にクレームする
  const claimedAt = new Date().toISOString();

  let claimed: UnsentComment[];
  try {
    claimed = await db
      .update(db._schema.comments)
      .set({ sentAt: claimedAt })
      .where(isNull(db._schema.comments.sentAt))
      .returning({ id: db._schema.comments.id });
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

  // k8o-push APIに通知を送信(リトライ付き)
  try {
    await sendPushNotificationWithRetry(
      K8O_PUSH_API_KEY,
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
          inArray(
            db._schema.comments.id,
            notifications.map((n) => n.id),
          ),
        )
        .execute();
    } catch (revertError) {
      console.error('sentAtフィールドの復帰に失敗しました:', revertError);
    }
    return NextResponse.json(
      { ok: false, error: 'プッシュ通知の送信に失敗しました' },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
