'use client';

import { Alert, Button, Card, SubscribeIcon } from '@k8ordo/ui';
import {
  useEffect,
  useState,
  useSyncExternalStore,
  useTransition,
} from 'react';
import type { FC } from 'react';

import { publicApi } from '@/shared/api/public-api';

type Props = {
  vapidPublicKey: string;
};

const SUBSCRIBE_ERROR_MESSAGES = {
  invalid_request: '購読情報が不正です',
  endpoint_not_allowed: '許可されていない通知エンドポイントです',
  invalid_keys: '購読鍵の形式が不正です',
} as const;

const SUBSCRIBE_FAILED_MESSAGE = '購読の登録に失敗しました';
const UNSUBSCRIBE_FAILED_MESSAGE = '購読の解除に失敗しました';

// api に登録できなかった理由を返す。登録できたら null
const registerSubscription = async (
  subscription: PushSubscription,
): Promise<string | null> => {
  const json = subscription.toJSON();
  try {
    const res = await publicApi.public['push-subscriptions'].$post({
      json: {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: json.keys?.['p256dh'] ?? '',
          auth: json.keys?.['auth'] ?? '',
        },
      },
    });
    if (res.ok) {
      return null;
    }
    // hc の型にはルートが返すステータスしか無く、csrf の 403 や想定外の 500 は含まれない
    const status: number = res.status;
    if (status === 400) {
      return SUBSCRIBE_ERROR_MESSAGES[(await res.json()).error];
    }
  } catch {
    // 通信の失敗も、登録できなかったものとして扱う
  }
  return SUBSCRIBE_FAILED_MESSAGE;
};

// プッシュ通知対応は変化しないため、購読(変更通知)は不要。
const subscribeNoop = (): (() => void) => () => undefined;

const urlBase64ToUint8Array = (
  base64String: string,
): Uint8Array<ArrayBuffer> => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replaceAll('-', '+')
    .replaceAll('_', '/');
  const rawData = atob(base64);
  return Uint8Array.from(rawData, (c) => c.codePointAt(0) ?? 0);
};

export const PushSubscribe: FC<Props> = ({ vapidPublicKey }) => {
  // 機能対応は navigator/window 依存で SSR では判定できないため、
  // useSyncExternalStore でクライアント確定値を読む(サーバーは鍵有無で代替)。
  const isSupported = useSyncExternalStore(
    subscribeNoop,
    () =>
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      vapidPublicKey !== '',
    () => vapidPublicKey !== '',
  );

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // 外部システム(PushManager)から現在の購読状態を同期する。
  // getSubscription() は非同期で useSyncExternalStore では読めないため Effect を使う。
  useEffect(() => {
    let ignore = false;

    if (isSupported) {
      const syncSubscription = async () => {
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          if (!ignore) {
            setIsSubscribed(subscription !== null);
          }
        } catch (e) {
          console.error('購読状態の取得に失敗しました:', e);
        }
      };
      void syncSubscription();
    }

    return () => {
      ignore = true;
    };
  }, [isSupported]);

  const subscribe = (): void => {
    setError(null);
    startTransition(async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey).buffer,
        });

        // api に無い購読をブラウザに残すと、通知が届かないのに購読中と表示される
        const failure = await registerSubscription(subscription);
        if (failure !== null) {
          await subscription.unsubscribe();
          throw new Error(failure);
        }

        setIsSubscribed(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : '購読に失敗しました');
      }
    });
  };

  const unsubscribe = (): void => {
    setError(null);
    startTransition(async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (subscription !== null) {
          // subscribe と対称に、サーバー側の削除成功を確認してから
          // ブラウザ側の購読解除と UI 更新を行う。
          const res = await publicApi.public['push-subscriptions']
            .$delete({
              json: {
                endpoint: subscription.endpoint,
                auth: subscription.toJSON().keys?.['auth'] ?? '',
              },
            })
            .catch(() => null);
          if (res === null || !res.ok) {
            throw new Error(UNSUBSCRIBE_FAILED_MESSAGE);
          }
          await subscription.unsubscribe();
        }

        setIsSubscribed(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : '購読解除に失敗しました');
      }
    });
  };

  return (
    <Card width="full" variant="outline">
      <div className="flex flex-col gap-4 p-6">
        <p className="text-fg-base text-sm">
          ReadingsとBrowser Supportの更新をプッシュ通知で受け取れます。
        </p>
        {!isSupported && (
          <Alert
            tone="warning"
            message="このブラウザはプッシュ通知に対応していません。iOSではホーム画面に追加したアプリから開いてください。"
          />
        )}
        {error !== null && <Alert tone="error" message={error} />}
        {isSubscribed && <Alert tone="success" message="通知を購読中です" />}
        {isSupported && (
          <div>
            {isSubscribed ? (
              <Button
                color="base"
                variant="outline"
                disabled={isPending}
                onClick={unsubscribe}
                startIcon={<SubscribeIcon />}
              >
                {isPending ? '処理中...' : '購読を解除する'}
              </Button>
            ) : (
              <Button
                color="primary"
                variant="solid"
                disabled={isPending}
                onClick={subscribe}
                startIcon={<SubscribeIcon />}
              >
                {isPending ? '処理中...' : '通知を受け取る'}
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
