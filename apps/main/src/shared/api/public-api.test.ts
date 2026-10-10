import { publicApi } from './public-api';

const fetchMock = vi.fn<typeof fetch>();
const connection = { onLine: true };
const browserWindow = new EventTarget();

const INQUIRIES_URL = 'https://api.k8o.me/public/inquiries';

const sendInquiry = (): Promise<Response> =>
  publicApi.public.inquiries.$post({ json: { message: 'こんにちは' } });

const inquiryRequest = (): unknown[] => [
  INQUIRIES_URL,
  expect.objectContaining({
    method: 'POST',
    body: JSON.stringify({ message: 'こんにちは' }),
  }),
];

const goOffline = (): void => {
  connection.onLine = false;
};

const goOnline = (): void => {
  connection.onLine = true;
  browserWindow.dispatchEvent(new Event('online'));
};

beforeEach(() => {
  fetchMock.mockReset();
  connection.onLine = true;
  vi.stubGlobal('fetch', fetchMock);
  vi.stubGlobal('navigator', connection);
  vi.stubGlobal('window', browserWindow);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('publicApi', () => {
  describe('正常系', () => {
    it('本番の api に送る', async () => {
      fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

      const res = await sendInquiry();

      expect(res.status).toBe(204);
      expect(fetchMock).toHaveBeenCalledExactlyOnceWith(...inquiryRequest());
    });

    it('オフラインで送れなかったら、接続が戻ってから同じリクエストを送り直す', async () => {
      vi.useFakeTimers();
      fetchMock
        .mockRejectedValueOnce(new TypeError('Failed to fetch'))
        .mockResolvedValueOnce(new Response(null, { status: 204 }));
      goOffline();

      let settled = false;
      const pending = sendInquiry().finally(() => {
        settled = true;
      });
      await vi.advanceTimersByTimeAsync(10_000);
      expect(settled).toBe(false);
      expect(fetchMock).toHaveBeenCalledOnce();

      goOnline();

      await expect(pending).resolves.toHaveProperty('status', 204);
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock).toHaveBeenLastCalledWith(...inquiryRequest());
    });

    it('接続が戻った直後の送り直しが失敗しても、間を空けてやり直す', async () => {
      vi.useFakeTimers();
      fetchMock
        .mockRejectedValueOnce(new TypeError('Failed to fetch'))
        .mockRejectedValueOnce(new TypeError('Failed to fetch'))
        .mockResolvedValueOnce(new Response(null, { status: 204 }));
      goOffline();

      const pending = sendInquiry();
      await vi.advanceTimersByTimeAsync(0);
      goOnline();
      await vi.advanceTimersByTimeAsync(1000);

      await expect(pending).resolves.toHaveProperty('status', 204);
      expect(fetchMock).toHaveBeenLastCalledWith(...inquiryRequest());
    });
  });

  describe('異常系', () => {
    it('オンラインのまま送れなかったら、送り直さずに失敗させる', async () => {
      fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(sendInquiry()).rejects.toThrow('Failed to fetch');
      expect(fetchMock).toHaveBeenCalledOnce();
    });

    it('接続が戻っても送れない状態が続いたら、やり直しを打ち切って失敗させる', async () => {
      vi.useFakeTimers();
      fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
      goOffline();

      const outcome = sendInquiry().catch((error: unknown) => error);
      await vi.advanceTimersByTimeAsync(0);
      goOnline();
      await vi.advanceTimersByTimeAsync(60_000);

      await expect(outcome).resolves.toStrictEqual(
        new TypeError('Failed to fetch'),
      );
    });
  });
});
