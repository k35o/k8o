import { db } from '@repo/database';

import { sendManualPush, sendPushNotification } from './push-notification';
import { sendWebPush, WebPushError } from './web-push';

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

vi.mock('drizzle-orm', () => ({
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
    vi.clearAllMocks();
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
        failed: 0,
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

    it('WebPushError 以外のエラーは failed に数えるが購読は削除しない', async () => {
      vi.mocked(db.query.pushSubscriptions.findMany).mockResolvedValue([
        subscription(FCM_ENDPOINT),
      ] as never);
      vi.mocked(sendWebPush).mockRejectedValue(new Error('network error'));

      await sendPushNotification(notificationParams);

      expect(updateSetMock).toHaveBeenCalledWith({ succeeded: 0, failed: 1 });
      expect(db.delete).not.toHaveBeenCalled();
    });
  });

  describe('dedupe', () => {
    it('既に claim 済み(dedupeKey 重複)なら送信しない', async () => {
      insertReturningMock.mockResolvedValue([]);

      await sendPushNotification(notificationParams);

      expect(db.query.pushSubscriptions.findMany).not.toHaveBeenCalled();
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

describe('sendManualPush', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('VAPID_PUBLIC_KEY', 'vapid-public');
    vi.stubEnv('VAPID_PRIVATE_KEY', 'vapid-private');
    vi.stubEnv('VAPID_SUBJECT', 'mailto:admin@example.com');

    vi.mocked(db.delete).mockReturnValue({ where: deleteWhereMock } as never);
    vi.mocked(db.query.pushSubscriptions.findMany).mockResolvedValue([]);
    vi.mocked(sendWebPush).mockResolvedValue(new Response());
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('正常系', () => {
    it('集計を返し push_logs には記録しない', async () => {
      vi.mocked(db.query.pushSubscriptions.findMany).mockResolvedValue([
        subscription(FCM_ENDPOINT),
        subscription(MOZILLA_ENDPOINT),
      ] as never);
      vi.mocked(sendWebPush)
        .mockResolvedValueOnce(new Response())
        .mockRejectedValueOnce(new WebPushError(500, 'Server error'));

      const result = await sendManualPush({
        title: '手動通知',
        body: 'テスト',
        url: 'https://k8o.me',
      });

      expect(result).toEqual({ succeeded: 1, failed: 1 });
      expect(db.insert).not.toHaveBeenCalled();
      expect(db.update).not.toHaveBeenCalled();
    });

    it('410 を返した endpoint の購読レコードを削除する', async () => {
      vi.mocked(db.query.pushSubscriptions.findMany).mockResolvedValue([
        subscription(FCM_ENDPOINT),
      ] as never);
      vi.mocked(sendWebPush).mockRejectedValue(new WebPushError(410, 'Gone'));

      const result = await sendManualPush({
        title: '手動通知',
        body: 'テスト',
        url: 'https://k8o.me',
      });

      expect(result).toEqual({ succeeded: 0, failed: 1 });
      expect(deleteWhereMock).toHaveBeenCalledWith({
        column: db._schema.pushSubscriptions.endpoint,
        values: [FCM_ENDPOINT],
      });
    });
  });

  describe('異常系', () => {
    it('VAPID 環境変数が未設定なら例外を投げる', async () => {
      vi.stubEnv('VAPID_SUBJECT', '');

      await expect(
        sendManualPush({ title: 't', body: 'b', url: 'https://k8o.me' }),
      ).rejects.toThrow('VAPID 環境変数が設定されていません');
    });
  });
});
