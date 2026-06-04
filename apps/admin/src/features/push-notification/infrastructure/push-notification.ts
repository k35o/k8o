import { db } from '@repo/database';
import type { PushLogKind } from '@repo/database/schema';
import { isAllowedPushEndpoint } from '@repo/helpers/push-endpoint';
import { eq, inArray } from 'drizzle-orm';

import { sendWebPush, WebPushError } from './web-push';

type SendPushNotificationParams = {
  kind: PushLogKind;
  title: string;
  body: string;
  url: string;
  // cron 再実行などによる二重通知を防ぐためのキー
  dedupeKey: string;
};

type VapidConfig = {
  publicKey: string;
  privateKey: string;
  subject: string;
};

type DeliveryResult = {
  succeeded: number;
  failed: number;
  goneEndpoints: string[];
};

// 購読が無効になったとみなして削除する HTTP ステータス
const GONE_STATUSES = new Set([404, 410]);

const readVapidConfig = (): VapidConfig | null => {
  const publicKey = process.env['VAPID_PUBLIC_KEY'];
  const privateKey = process.env['VAPID_PRIVATE_KEY'];
  const subject = process.env['VAPID_SUBJECT'];
  if (
    publicKey === undefined ||
    publicKey === '' ||
    privateKey === undefined ||
    privateKey === '' ||
    subject === undefined ||
    subject === ''
  ) {
    return null;
  }
  return { publicKey, privateKey, subject };
};

const deliverToSubscriptions = async (
  payload: string,
  vapid: VapidConfig,
): Promise<DeliveryResult> => {
  const subscriptions = await db.query.pushSubscriptions.findMany({
    columns: { endpoint: true, p256dh: true, auth: true },
  });

  // 多層防御: 保存時に検証済みだが、送信直前にも allowlist を再チェックする
  const valid = subscriptions.filter((sub) =>
    isAllowedPushEndpoint(sub.endpoint),
  );

  // Promise.allSettled は reason が any になるため、結果を型付きに正規化する
  const results = await Promise.all(
    valid.map(async (sub) => {
      try {
        await sendWebPush(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload,
          {
            vapidPublicKey: vapid.publicKey,
            vapidPrivateKey: vapid.privateKey,
            vapidSubject: vapid.subject,
          },
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
    } else if (result.status !== null && GONE_STATUSES.has(result.status)) {
      goneEndpoints.push(result.endpoint);
    }
  }

  return { succeeded, failed: results.length - succeeded, goneEndpoints };
};

export async function sendPushNotification({
  kind,
  title,
  body,
  url,
  dedupeKey,
}: SendPushNotificationParams): Promise<void> {
  const vapid = readVapidConfig();
  if (vapid === null) {
    console.warn('VAPID 環境変数が設定されていません');
    return;
  }

  // claim-first: 送信前に dedupeKey で履歴行を確保する。unique 制約により
  // 並行 cron 実行でも claim できた1実行だけが送信し、二重通知を防ぐ。
  const claimed = await db
    .insert(db._schema.pushLogs)
    .values({ kind, title, body, url, dedupeKey, succeeded: 0, failed: 0 })
    .onConflictDoNothing({ target: db._schema.pushLogs.dedupeKey })
    .returning({ id: db._schema.pushLogs.id });
  const logId = claimed[0]?.id;
  if (logId === undefined) {
    return;
  }

  const payload = JSON.stringify({ title, body, url });
  const { succeeded, failed, goneEndpoints } = await deliverToSubscriptions(
    payload,
    vapid,
  );

  if (goneEndpoints.length > 0) {
    await db
      .delete(db._schema.pushSubscriptions)
      .where(inArray(db._schema.pushSubscriptions.endpoint, goneEndpoints));
  }

  await db
    .update(db._schema.pushLogs)
    .set({ succeeded, failed })
    .where(eq(db._schema.pushLogs.id, logId));
}
