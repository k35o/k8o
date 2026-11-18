import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  claimPushLog,
  recordPushLogResult,
} from '../infrastructure/push-log-repository';
import {
  deleteSubscriptionsByEndpoints,
  findSubscriptions,
} from '../infrastructure/subscription-repository';
import {
  InvalidSubscriptionKeysError,
  sendWebPush,
  WebPushError,
} from '../infrastructure/web-push';
import { sendPushNotification } from './send-push-notification';

vi.mock('../infrastructure/web-push', async () => {
  const actual = await vi.importActual<Record<string, unknown>>(
    '../infrastructure/web-push',
  );
  return { ...actual, sendWebPush: vi.fn() };
});

vi.mock('../infrastructure/push-log-repository', () => ({
  claimPushLog: vi.fn(),
  recordPushLogResult: vi.fn(),
}));

vi.mock('../infrastructure/subscription-repository', () => ({
  findSubscriptions: vi.fn(),
  deleteSubscriptionsByEndpoints: vi.fn(),
}));

const FCM_ENDPOINT = 'https://fcm.googleapis.com/fcm/send/abc';
const MOZILLA_ENDPOINT = 'https://updates.push.services.mozilla.com/wpush/v2/x';
const APPLE_ENDPOINT = 'https://web.push.apple.com/xyz';

const subscription = (
  endpoint: string,
): { endpoint: string; p256dh: string; auth: string } => ({
  endpoint,
  p256dh: 'p256dh-key',
  auth: 'auth-secret',
});

const notificationParams = {
  kind: 'readings_updated' as const,
  title: '新着記事',
  body: '記事が追加されました',
  url: 'https://k8o.me/readings',
  dedupeKey: 'readings:2026-07-02',
};

describe('sendPushNotification', () => {
  beforeEach(() => {
    vi.stubEnv('VAPID_PUBLIC_KEY', 'vapid-public');
    vi.stubEnv('VAPID_PRIVATE_KEY', 'vapid-private');
    vi.stubEnv('VAPID_SUBJECT', 'mailto:admin@example.com');

    vi.mocked(claimPushLog).mockResolvedValue(10);
    vi.mocked(recordPushLogResult).mockResolvedValue();
    vi.mocked(deleteSubscriptionsByEndpoints).mockResolvedValue();
    vi.mocked(findSubscriptions).mockResolvedValue([]);
    vi.mocked(sendWebPush).mockResolvedValue(new Response());
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  describe('正常系', () => {
    it('claim に成功したら全購読へ送信し succeeded/failed を記録する', async () => {
      vi.mocked(findSubscriptions).mockResolvedValue([
        subscription(FCM_ENDPOINT),
        subscription(MOZILLA_ENDPOINT),
      ]);

      await sendPushNotification(notificationParams);

      expect(claimPushLog).toHaveBeenCalledWith({
        kind: 'readings_updated',
        title: '新着記事',
        body: '記事が追加されました',
        url: 'https://k8o.me/readings',
        dedupeKey: 'readings:2026-07-02',
        succeeded: 0,
        failed: 2,
      });
      expect(sendWebPush).toHaveBeenCalledTimes(2);
      expect(sendWebPush).toHaveBeenCalledWith(
        {
          endpoint: FCM_ENDPOINT,
          keys: { p256dh: 'p256dh-key', auth: 'auth-secret' },
        },
        JSON.stringify({
          title: '新着記事',
          body: '記事が追加されました',
          url: 'https://k8o.me/readings',
        }),
        {
          publicKey: 'vapid-public',
          privateKey: 'vapid-private',
          subject: 'mailto:admin@example.com',
        },
      );
      expect(recordPushLogResult).toHaveBeenCalledWith(10, {
        succeeded: 2,
        failed: 0,
      });
      expect(deleteSubscriptionsByEndpoints).not.toHaveBeenCalled();
    });

    it('送信失敗した購読は failed として集計する', async () => {
      vi.mocked(findSubscriptions).mockResolvedValue([
        subscription(FCM_ENDPOINT),
        subscription(MOZILLA_ENDPOINT),
      ]);
      vi.mocked(sendWebPush)
        .mockRejectedValueOnce(new WebPushError(500, 'Server error'))
        .mockResolvedValueOnce(new Response());

      await sendPushNotification(notificationParams);

      expect(recordPushLogResult).toHaveBeenCalledWith(10, {
        succeeded: 1,
        failed: 1,
      });
      expect(deleteSubscriptionsByEndpoints).not.toHaveBeenCalled();
    });

    it('404/410 を返した endpoint の購読レコードだけ削除する', async () => {
      vi.mocked(findSubscriptions).mockResolvedValue([
        subscription(FCM_ENDPOINT),
        subscription(MOZILLA_ENDPOINT),
        subscription(APPLE_ENDPOINT),
      ]);
      vi.mocked(sendWebPush)
        .mockRejectedValueOnce(new WebPushError(410, 'Gone'))
        .mockRejectedValueOnce(new WebPushError(404, 'Not Found'))
        .mockResolvedValueOnce(new Response());

      await sendPushNotification(notificationParams);

      expect(recordPushLogResult).toHaveBeenCalledWith(10, {
        succeeded: 1,
        failed: 2,
      });
      expect(deleteSubscriptionsByEndpoints).toHaveBeenCalledWith([
        FCM_ENDPOINT,
        MOZILLA_ENDPOINT,
      ]);
    });

    it('鍵を読み込めない購読は、応答が無くても削除する', async () => {
      vi.mocked(findSubscriptions).mockResolvedValue([
        subscription(FCM_ENDPOINT),
        subscription(MOZILLA_ENDPOINT),
      ]);
      vi.mocked(sendWebPush)
        .mockRejectedValueOnce(new InvalidSubscriptionKeysError())
        .mockResolvedValueOnce(new Response());

      await sendPushNotification(notificationParams);

      expect(recordPushLogResult).toHaveBeenCalledWith(10, {
        succeeded: 1,
        failed: 1,
      });
      expect(deleteSubscriptionsByEndpoints).toHaveBeenCalledWith([
        FCM_ENDPOINT,
      ]);
    });

    it('同時に送るのは10件までに絞り、全件に送る', async () => {
      const subscriptions = Array.from({ length: 25 }, (_, i) =>
        subscription(`${FCM_ENDPOINT}${i}`),
      );
      vi.mocked(findSubscriptions).mockResolvedValue(subscriptions);
      let inFlight = 0;
      let maxInFlight = 0;
      vi.mocked(sendWebPush).mockImplementation(async () => {
        inFlight += 1;
        maxInFlight = Math.max(maxInFlight, inFlight);
        await new Promise((resolve) => {
          setTimeout(resolve, 0);
        });
        inFlight -= 1;
        return new Response();
      });

      await sendPushNotification(notificationParams);

      expect(maxInFlight).toBe(10);
      expect(sendWebPush).toHaveBeenCalledTimes(25);
      expect(recordPushLogResult).toHaveBeenCalledWith(10, {
        succeeded: 25,
        failed: 0,
      });
    });
  });

  describe('dedupe', () => {
    it('既に claim 済み(dedupeKey 重複)なら送信しない', async () => {
      vi.mocked(findSubscriptions).mockResolvedValue([
        subscription(FCM_ENDPOINT),
      ]);
      vi.mocked(claimPushLog).mockResolvedValue(null);

      await sendPushNotification(notificationParams);

      expect(sendWebPush).not.toHaveBeenCalled();
      expect(recordPushLogResult).not.toHaveBeenCalled();
    });
  });

  describe('異常系', () => {
    it('VAPID 環境変数が未設定なら警告して何もしない', async () => {
      vi.stubEnv('VAPID_PRIVATE_KEY', '');
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await sendPushNotification(notificationParams);

      expect(warnSpy).toHaveBeenCalledWith(
        'VAPID 環境変数が設定されていません',
      );
      expect(claimPushLog).not.toHaveBeenCalled();
      expect(sendWebPush).not.toHaveBeenCalled();

      warnSpy.mockRestore();
    });

    it.each([
      [
        '名前解決できない',
        new TypeError('fetch failed', {
          cause: Object.assign(
            new Error('getaddrinfo ENOTFOUND missing.push.apple.com'),
            { code: 'ENOTFOUND' },
          ),
        }),
      ],
      [
        '時間内に応答が無い',
        new DOMException(
          'The operation was aborted due to timeout',
          'TimeoutError',
        ),
      ],
      [
        'VAPID の鍵を読み込めない',
        new DOMException('Invalid keyData', 'DataError'),
      ],
    ])('%s失敗は failed に数えるが購読は削除しない', async (_, error) => {
      vi.mocked(findSubscriptions).mockResolvedValue([
        subscription(FCM_ENDPOINT),
      ]);
      vi.mocked(sendWebPush).mockRejectedValue(error);

      await sendPushNotification(notificationParams);

      expect(recordPushLogResult).toHaveBeenCalledWith(10, {
        succeeded: 0,
        failed: 1,
      });
      expect(deleteSubscriptionsByEndpoints).not.toHaveBeenCalled();
    });

    it('購読を読み込めなければ claim せず、再実行で送れる状態を残す', async () => {
      vi.mocked(findSubscriptions).mockRejectedValue(
        new Error('db unavailable'),
      );

      await expect(sendPushNotification(notificationParams)).rejects.toThrow(
        'db unavailable',
      );

      expect(claimPushLog).not.toHaveBeenCalled();
    });

    it('購読の削除に失敗しても、送信結果は記録する', async () => {
      vi.mocked(findSubscriptions).mockResolvedValue([
        subscription(FCM_ENDPOINT),
        subscription(MOZILLA_ENDPOINT),
      ]);
      vi.mocked(sendWebPush)
        .mockRejectedValueOnce(new WebPushError(410, 'Gone'))
        .mockResolvedValueOnce(new Response());
      vi.mocked(deleteSubscriptionsByEndpoints).mockRejectedValueOnce(
        new Error('db unavailable'),
      );

      await expect(sendPushNotification(notificationParams)).rejects.toThrow(
        'db unavailable',
      );

      expect(recordPushLogResult).toHaveBeenCalledWith(10, {
        succeeded: 1,
        failed: 1,
      });
    });
  });

  describe('エッジケース', () => {
    it('allowlist 外の endpoint には送信せず集計にも含めない', async () => {
      vi.mocked(findSubscriptions).mockResolvedValue([
        subscription('https://evil.example.com/push'),
        subscription(FCM_ENDPOINT),
      ]);

      await sendPushNotification(notificationParams);

      expect(sendWebPush).toHaveBeenCalledTimes(1);
      expect(sendWebPush).toHaveBeenCalledWith(
        expect.objectContaining({ endpoint: FCM_ENDPOINT }),
        expect.any(String),
        expect.any(Object),
      );
      expect(recordPushLogResult).toHaveBeenCalledWith(10, {
        succeeded: 1,
        failed: 0,
      });
    });

    it('購読が1件も無ければ succeeded/failed を 0 で記録する', async () => {
      await sendPushNotification(notificationParams);

      expect(sendWebPush).not.toHaveBeenCalled();
      expect(recordPushLogResult).toHaveBeenCalledWith(10, {
        succeeded: 0,
        failed: 0,
      });
    });
  });
});
