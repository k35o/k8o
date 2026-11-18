import type { PushLogKind } from '@repo/database/schema';
import { mapWithConcurrency } from '@repo/helpers/array/map-with-concurrency';

import { isAllowedPushEndpoint } from '../infrastructure/is-allowed-push-endpoint';
import {
  claimPushLog,
  recordPushLogResult,
} from '../infrastructure/push-log-repository';
import {
  deleteSubscriptionsByEndpoints,
  findSubscriptions,
} from '../infrastructure/subscription-repository';
import type { StoredSubscription } from '../infrastructure/subscription-repository';
import type { VapidConfig } from '../infrastructure/vapid';
import {
  InvalidSubscriptionKeysError,
  sendWebPush,
  WebPushError,
} from '../infrastructure/web-push';

type SendPushNotificationParams = {
  kind: PushLogKind;
  title: string;
  body: string;
  url: string;
  dedupeKey: string;
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
  const subscriptions = await findSubscriptions();
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
          vapid,
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

  // 送信の途中で関数が止まると結果が分からないので、全件を失敗として確保しておき、結果で上書きする
  const logId = await claimPushLog({
    kind,
    title,
    body,
    url,
    dedupeKey,
    succeeded: 0,
    failed: subscriptions.length,
  });
  if (logId === null) {
    return;
  }

  const payload = JSON.stringify({ title, body, url });
  const { succeeded, failed, deadEndpoints } = await deliverToSubscriptions(
    subscriptions,
    payload,
    vapid,
  );

  // 購読の掃除に失敗しても送信結果は残るよう、記録を先にする
  await recordPushLogResult(logId, { succeeded, failed });

  if (deadEndpoints.length > 0) {
    await deleteSubscriptionsByEndpoints(deadEndpoints);
  }
}
