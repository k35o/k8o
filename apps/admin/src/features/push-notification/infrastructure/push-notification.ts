import { db } from '@repo/database';
import { isAllowedPushEndpoint } from '@repo/helpers/push-endpoint';
import { eq, inArray } from 'drizzle-orm';

import { sendWebPush, WebPushError } from './web-push';

type PushLogKind = 'readings_updated' | 'baseline_updated';

type SendPushNotificationParams = {
  kind: PushLogKind;
  title: string;
  body: string;
  url: string;
  // cron 再実行などによる二重通知を防ぐためのキー
  dedupeKey: string;
};

// 購読が無効になったとみなして削除する HTTP ステータス
const GONE_STATUSES = new Set([404, 410]);

export async function sendPushNotification({
  kind,
  title,
  body,
  url,
  dedupeKey,
}: SendPushNotificationParams): Promise<void> {
  const vapidPublicKey = process.env['VAPID_PUBLIC_KEY'];
  const vapidPrivateKey = process.env['VAPID_PRIVATE_KEY'];
  const vapidSubject = process.env['VAPID_SUBJECT'];

  if (
    vapidPublicKey === undefined ||
    vapidPublicKey === '' ||
    vapidPrivateKey === undefined ||
    vapidPrivateKey === '' ||
    vapidSubject === undefined ||
    vapidSubject === ''
  ) {
    console.warn('VAPID 環境変数が設定されていません');
    return;
  }

  // dedupe(claim-first): 送信前に dedupeKey で push_logs 行を確保する。
  // unique 制約により、並行 cron 実行でも claim できた1実行だけが送信する
  // （findFirst→送信→insert だと両方が送信してしまうレースを防ぐ）。
  const claimed = await db
    .insert(db._schema.pushLogs)
    .values({ kind, title, body, url, dedupeKey, succeeded: 0, failed: 0 })
    .onConflictDoNothing({ target: db._schema.pushLogs.dedupeKey })
    .returning({ id: db._schema.pushLogs.id });

  const logId = claimed[0]?.id;
  if (logId === undefined) {
    // 既に他の実行が claim 済み = 送信不要
    return;
  }

  const subscriptions = await db.query.pushSubscriptions.findMany({
    columns: { endpoint: true, p256dh: true, auth: true },
  });

  // 多層防御: 保存時に検証済みだが、送信直前にも allowlist を再チェックする
  const validSubscriptions = subscriptions.filter((sub) =>
    isAllowedPushEndpoint(sub.endpoint),
  );

  const payload = JSON.stringify({ title, body, url });

  // 各送信を try/catch で包み、型付きの結果に正規化する
  // （Promise.allSettled の reason は any になり型安全性が落ちるため使わない）
  const results = await Promise.all(
    validSubscriptions.map(async (sub) => {
      try {
        await sendWebPush(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload,
          { vapidPublicKey, vapidPrivateKey, vapidSubject },
        );
        return { ok: true as const };
      } catch (error) {
        const status = error instanceof WebPushError ? error.status : null;
        return { ok: false as const, endpoint: sub.endpoint, status };
      }
    }),
  );

  let succeeded = 0;
  const goneEndpoints: string[] = [];
  for (const result of results) {
    if (result.ok) {
      succeeded += 1;
      continue;
    }
    if (result.status !== null && GONE_STATUSES.has(result.status)) {
      goneEndpoints.push(result.endpoint);
    }
  }

  const failed = results.length - succeeded;

  // 無効になった購読を削除する
  if (goneEndpoints.length > 0) {
    await db
      .delete(db._schema.pushSubscriptions)
      .where(inArray(db._schema.pushSubscriptions.endpoint, goneEndpoints));
  }

  // claim した履歴行に送信結果を反映する
  await db
    .update(db._schema.pushLogs)
    .set({ succeeded, failed })
    .where(eq(db._schema.pushLogs.id, logId));
}
