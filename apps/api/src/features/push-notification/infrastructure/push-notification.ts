import { db } from '@repo/database';
import { eq, inArray } from '@repo/database/orm';
import type { PushLogKind } from '@repo/database/schema';
import { mapWithConcurrency } from '@repo/helpers/array/map-with-concurrency';
import { isAllowedPushEndpoint } from '@repo/helpers/push-endpoint';

import {
  InvalidSubscriptionKeysError,
  sendWebPush,
  WebPushError,
} from './web-push';

type SendPushNotificationParams = {
  kind: PushLogKind;
  title: string;
  body: string;
  url: string;
  dedupeKey: string;
};

type VapidConfig = {
  publicKey: string;
  privateKey: string;
  subject: string;
};

type StoredSubscription = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

type DeliveryOutcome = 'succeeded' | 'failed' | 'dead';

type DeliveryResult = {
  succeeded: number;
  failed: number;
  deadEndpoints: string[];
};

const PUSH_CONCURRENCY = 10;

// 購読が無効になったとみなして削除する HTTP ステータス
const GONE_STATUSES = new Set([404, 410]);

// 応答の無い失敗（名前解決・接続・TLS・時間切れ）は一時的な障害と見分けられず、消した購読は
// 利用者が購読し直すまで戻らないので、鍵が読めないとき以外は残す
const isDeadSubscription = (error: unknown): boolean =>
  error instanceof WebPushError
    ? GONE_STATUSES.has(error.status)
    : error instanceof InvalidSubscriptionKeysError;

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

const findDeliverableSubscriptions = async (): Promise<
  StoredSubscription[]
> => {
  const subscriptions = await db.query.pushSubscriptions.findMany({
    columns: { endpoint: true, p256dh: true, auth: true },
  });
  // 多層防御: 保存時に検証済みだが、送信直前にも allowlist を再チェックする
  return subscriptions.filter((sub) => isAllowedPushEndpoint(sub.endpoint));
};

const deliverToSubscriptions = async (
  subscriptions: readonly StoredSubscription[],
  payload: string,
  vapid: VapidConfig,
): Promise<DeliveryResult> => {
  const outcomes = await mapWithConcurrency(
    subscriptions,
    PUSH_CONCURRENCY,
    async (sub): Promise<DeliveryOutcome> => {
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
        return 'succeeded';
      } catch (error) {
        return isDeadSubscription(error) ? 'dead' : 'failed';
      }
    },
  );

  const succeeded = outcomes.filter((outcome) => outcome === 'succeeded');
  return {
    succeeded: succeeded.length,
    failed: outcomes.length - succeeded.length,
    deadEndpoints: subscriptions
      .filter((_, index) => outcomes[index] === 'dead')
      .map((sub) => sub.endpoint),
  };
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

  // claim より先に読む。読み込みに失敗したとき、claim だけが残って再実行でも送れなくなるのを避ける
  const subscriptions = await findDeliverableSubscriptions();

  // 送信より前に dedupeKey で履歴行を確保する。unique 制約により
  // 並行 cron 実行でも claim できた1実行だけが送信し、二重通知を防ぐ。
  // 送信の途中で関数が止まると結果が分からないので、全件を失敗として確保しておき、結果で上書きする
  const claimed = await db
    .insert(db._schema.pushLogs)
    .values({
      kind,
      title,
      body,
      url,
      dedupeKey,
      succeeded: 0,
      failed: subscriptions.length,
    })
    .onConflictDoNothing({ target: db._schema.pushLogs.dedupeKey })
    .returning({ id: db._schema.pushLogs.id });
  const logId = claimed[0]?.id;
  if (logId === undefined) {
    return;
  }

  const payload = JSON.stringify({ title, body, url });
  const { succeeded, failed, deadEndpoints } = await deliverToSubscriptions(
    subscriptions,
    payload,
    vapid,
  );

  // 購読の掃除に失敗しても送信結果は残るよう、記録を先にする
  await db
    .update(db._schema.pushLogs)
    .set({ succeeded, failed })
    .where(eq(db._schema.pushLogs.id, logId));

  if (deadEndpoints.length > 0) {
    await db
      .delete(db._schema.pushSubscriptions)
      .where(inArray(db._schema.pushSubscriptions.endpoint, deadEndpoints));
  }
}
