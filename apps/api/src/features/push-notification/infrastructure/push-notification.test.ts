import { db } from '@repo/database';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { sendPushNotification } from './push-notification';
import {
  InvalidSubscriptionKeysError,
  sendWebPush,
  WebPushError,
} from './web-push';

vi.mock('./web-push', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('./web-push');
  return { ...actual, sendWebPush: vi.fn() };
});

vi.mock('@repo/database', () => ({
  db: {
    query: {
      pushSubscriptions: {
        findMany: vi.fn(),
      },
    },
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    _schema: {
      pushLogs: { id: 'id', dedupeKey: 'dedupe_key' },
      pushSubscriptions: { endpoint: 'endpoint' },
    },
  },
}));

vi.mock('@repo/database/orm', () => ({
  eq: vi.fn((column: unknown, value: unknown) => ({ column, value })),
  inArray: vi.fn((column: unknown, values: unknown) => ({ column, values })),
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

const insertValuesMock = vi.fn();
const insertReturningMock = vi.fn();
const updateSetMock = vi.fn();
const updateWhereMock = vi.fn();
const deleteWhereMock = vi.fn();

describe('sendPushNotification', () => {
  beforeEach(() => {
    vi.stubEnv('VAPID_PUBLIC_KEY', 'vapid-public');
    vi.stubEnv('VAPID_PRIVATE_KEY', 'vapid-private');
    vi.stubEnv('VAPID_SUBJECT', 'mailto:admin@example.com');

    insertReturningMock.mockResolvedValue([{ id: 10 }]);
    insertValuesMock.mockReturnValue({
      onConflictDoNothing: vi
        .fn()
        .mockReturnValue({ returning: insertReturningMock }),
    });
    vi.mocked(db.insert).mockReturnValue({ values: insertValuesMock } as never);

    updateSetMock.mockReturnValue({ where: updateWhereMock });
    vi.mocked(db.update).mockReturnValue({ set: updateSetMock } as never);

    vi.mocked(db.delete).mockReturnValue({ where: deleteWhereMock } as never);

    vi.mocked(db.query.pushSubscriptions.findMany).mockResolvedValue([]);
    vi.mocked(sendWebPush).mockResolvedValue(new Response());
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('正常系', () => {
    it('claim に成功したら全購読へ送信し succeeded/failed を記録する', async () => {
      vi.mocked(db.query.pushSubscriptions.findMany).mockResolvedValue([
        subscription(FCM_ENDPOINT),
        subscription(MOZILLA_ENDPOINT),
      ] as never);

      await sendPushNotification(notificationParams);

      expect(insertValuesMock).toHaveBeenCalledWith({
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
          vapidPublicKey: 'vapid-public',
          vapidPrivateKey: 'vapid-private',
          vapidSubject: 'mailto:admin@example.com',
        },
      );
      expect(updateSetMock).toHaveBeenCalledWith({ succeeded: 2, failed: 0 });
      expect(db.delete).not.toHaveBeenCalled();
    });

    it('送信失敗した購読は failed として集計する', async () => {
      vi.mocked(db.query.pushSubscriptions.findMany).mockResolvedValue([
        subscription(FCM_ENDPOINT),
        subscription(MOZILLA_ENDPOINT),
      ] as never);
      vi.mocked(sendWebPush)
        .mockRejectedValueOnce(new WebPushError(500, 'Server error'))
        .mockResolvedValueOnce(new Response());

      await sendPushNotification(notificationParams);

      expect(updateSetMock).toHaveBeenCalledWith({ succeeded: 1, failed: 1 });
      expect(db.delete).not.toHaveBeenCalled();
    });

    it('404/410 を返した endpoint の購読レコードだけ削除する', async () => {
      vi.mocked(db.query.pushSubscriptions.findMany).mockResolvedValue([
        subscription(FCM_ENDPOINT),
        subscription(MOZILLA_ENDPOINT),
        subscription(APPLE_ENDPOINT),
      ] as never);
      vi.mocked(sendWebPush)
        .mockRejectedValueOnce(new WebPushError(410, 'Gone'))
        .mockRejectedValueOnce(new WebPushError(404, 'Not Found'))
        .mockResolvedValueOnce(new Response());

      await sendPushNotification(notificationParams);

      expect(updateSetMock).toHaveBeenCalledWith({ succeeded: 1, failed: 2 });
      expect(db.delete).toHaveBeenCalledTimes(1);
      expect(deleteWhereMock).toHaveBeenCalledWith({
        column: db._schema.pushSubscriptions.endpoint,
        values: [FCM_ENDPOINT, MOZILLA_ENDPOINT],
      });
    });

    it('鍵を読み込めない購読は、応答が無くても削除する', async () => {
      vi.mocked(db.query.pushSubscriptions.findMany).mockResolvedValue([
        subscription(FCM_ENDPOINT),
        subscription(MOZILLA_ENDPOINT),
      ] as never);
      vi.mocked(sendWebPush)
        .mockRejectedValueOnce(new InvalidSubscriptionKeysError())
        .mockResolvedValueOnce(new Response());

      await sendPushNotification(notificationParams);

      expect(updateSetMock).toHaveBeenCalledWith({ succeeded: 1, failed: 1 });
      expect(deleteWhereMock).toHaveBeenCalledWith({
        column: db._schema.pushSubscriptions.endpoint,
        values: [FCM_ENDPOINT],
      });
    });

    it('同時に送るのは10件までに絞り、全件に送る', async () => {
      const subscriptions = Array.from({ length: 25 }, (_, i) =>
        subscription(`${FCM_ENDPOINT}${i}`),
      );
      vi.mocked(db.query.pushSubscriptions.findMany).mockResolvedValue(
        subscriptions as never,
      );
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
      expect(updateSetMock).toHaveBeenCalledWith({ succeeded: 25, failed: 0 });
    });
  });

  describe('dedupe', () => {
    it('既に claim 済み(dedupeKey 重複)なら送信しない', async () => {
      vi.mocked(db.query.pushSubscriptions.findMany).mockResolvedValue([
        subscription(FCM_ENDPOINT),
      ] as never);
      insertReturningMock.mockResolvedValue([]);

      await sendPushNotification(notificationParams);

      expect(sendWebPush).not.toHaveBeenCalled();
      expect(db.update).not.toHaveBeenCalled();
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
      expect(db.insert).not.toHaveBeenCalled();
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
      vi.mocked(db.query.pushSubscriptions.findMany).mockResolvedValue([
        subscription(FCM_ENDPOINT),
      ] as never);
      vi.mocked(sendWebPush).mockRejectedValue(error);

      await sendPushNotification(notificationParams);

      expect(updateSetMock).toHaveBeenCalledWith({ succeeded: 0, failed: 1 });
      expect(db.delete).not.toHaveBeenCalled();
    });

    it('購読を読み込めなければ claim せず、再実行で送れる状態を残す', async () => {
      vi.mocked(db.query.pushSubscriptions.findMany).mockRejectedValue(
        new Error('db unavailable'),
      );

      await expect(sendPushNotification(notificationParams)).rejects.toThrow(
        'db unavailable',
      );

      expect(db.insert).not.toHaveBeenCalled();
    });

    it('購読の削除に失敗しても、送信結果は記録する', async () => {
      vi.mocked(db.query.pushSubscriptions.findMany).mockResolvedValue([
        subscription(FCM_ENDPOINT),
        subscription(MOZILLA_ENDPOINT),
      ] as never);
      vi.mocked(sendWebPush)
        .mockRejectedValueOnce(new WebPushError(410, 'Gone'))
        .mockResolvedValueOnce(new Response());
      deleteWhereMock.mockRejectedValueOnce(new Error('db unavailable'));

      await expect(sendPushNotification(notificationParams)).rejects.toThrow(
        'db unavailable',
      );

      expect(updateSetMock).toHaveBeenCalledWith({ succeeded: 1, failed: 1 });
    });
  });

  describe('エッジケース', () => {
    it('allowlist 外の endpoint には送信せず集計にも含めない', async () => {
      vi.mocked(db.query.pushSubscriptions.findMany).mockResolvedValue([
        subscription('https://evil.example.com/push'),
        subscription(FCM_ENDPOINT),
      ] as never);

      await sendPushNotification(notificationParams);

      expect(sendWebPush).toHaveBeenCalledTimes(1);
      expect(sendWebPush).toHaveBeenCalledWith(
        expect.objectContaining({ endpoint: FCM_ENDPOINT }),
        expect.any(String),
        expect.any(Object),
      );
      expect(updateSetMock).toHaveBeenCalledWith({ succeeded: 1, failed: 0 });
    });

    it('購読が1件も無ければ succeeded/failed を 0 で記録する', async () => {
      await sendPushNotification(notificationParams);

      expect(sendWebPush).not.toHaveBeenCalled();
      expect(updateSetMock).toHaveBeenCalledWith({ succeeded: 0, failed: 0 });
    });
  });
});
