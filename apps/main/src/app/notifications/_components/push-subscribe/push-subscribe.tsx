'use client';

import { Alert, Button, Card, SubscribeIcon } from '@k8o/arte-odyssey';
import {
  type FC,
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
} from 'react';

import {
  subscribePushAction,
  unsubscribePushAction,
} from '@/features/push-notification/interface/actions';

type Props = {
  vapidPublicKey: string;
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

// react-compiler の解析がこのコンポーネントで内部 invariant エラー
// (Expected optional value to resolve to call or member expression) を投げるため、
// ルールを無効化する。コード自体は正常で、修正されたら解除する。
// oxlint-disable-next-line react/react-compiler
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
  const [isLoading, setIsLoading] = useState(false);
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

  const subscribe = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey).buffer,
      });

      const json = subscription.toJSON();
      const result = await subscribePushAction({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: json.keys?.['p256dh'] ?? '',
          auth: json.keys?.['auth'] ?? '',
        },
      });

      if (!result.success) {
        await subscription.unsubscribe();
        throw new Error(result.message);
      }

      setIsSubscribed(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : '購読に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [vapidPublicKey]);

  const unsubscribe = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription !== null) {
        // subscribe と対称に、サーバー側の削除成功を確認してから
        // ブラウザ側の購読解除と UI 更新を行う。
        const result = await unsubscribePushAction({
          endpoint: subscription.endpoint,
          auth: subscription.toJSON().keys?.['auth'] ?? '',
        });
        if (!result.success) {
          throw new Error(result.message);
        }
        await subscription.unsubscribe();
      }

      setIsSubscribed(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : '購読解除に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <Card width="full" appearance="bordered">
      <div className="flex flex-col gap-4 p-6">
        <p className="text-fg-base text-sm">
          ReadingsとBaselineの更新をプッシュ通知で受け取れます。
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
                color="gray"
                variant="outline"
                disabled={isLoading}
                onClick={() => void unsubscribe()}
                startIcon={<SubscribeIcon />}
              >
                {isLoading ? '処理中...' : '購読を解除する'}
              </Button>
            ) : (
              <Button
                color="primary"
                variant="solid"
                disabled={isLoading}
                onClick={() => void subscribe()}
                startIcon={<SubscribeIcon />}
              >
                {isLoading ? '処理中...' : '通知を受け取る'}
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
