import { reportClientError } from './report-client-error';

const fetchMock = vi.fn<typeof fetch>();

const sentRequest = (): { init: RequestInit | undefined; body: unknown } => {
  const init = fetchMock.mock.calls[0]?.[1];
  const body = init?.body;
  if (typeof body !== 'string') {
    throw new TypeError('本文が JSON の文字列で送られていない');
  }
  return { init, body: JSON.parse(body) };
};

const createError = (stack: string): Error & { digest?: string } => {
  const error: Error & { digest?: string } = new TypeError('x is undefined');
  error.stack = stack;
  error.digest = 'abc123';
  return error;
};

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
  vi.stubGlobal('fetch', fetchMock);
  vi.stubGlobal('navigator', { onLine: true, userAgent: 'Mozilla/5.0' });
  vi.stubGlobal(
    'window',
    Object.assign(new EventTarget(), {
      location: { href: 'https://k8o.me/blog/media-pseudos' },
      navigator: { userAgent: 'Mozilla/5.0' },
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('reportClientError', () => {
  describe('正常系', () => {
    it('api の公開ルートへ、ページを離れても届くよう keepalive を付けて送る', async () => {
      reportClientError(createError('TypeError: x is undefined'));

      await vi.waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith(
          'https://api.k8o.me/public/reports',
          expect.objectContaining({ method: 'POST', keepalive: true }),
        );
      });
    });

    it('Reporting API と同じ形の client-error のレポートを1件送る', async () => {
      reportClientError(createError('TypeError: x is undefined'));

      await vi.waitFor(() => {
        expect(fetchMock).toHaveBeenCalledOnce();
      });
      expect(sentRequest().body).toStrictEqual([
        {
          type: 'client-error',
          age: 0,
          url: 'https://k8o.me/blog/media-pseudos',
          user_agent: 'Mozilla/5.0',
          body: {
            name: 'TypeError',
            message: 'x is undefined',
            digest: 'abc123',
            stack: 'TypeError: x is undefined',
          },
        },
      ]);
    });
  });

  describe('異常系', () => {
    it('送れなくても、処理されない reject を残さない', async () => {
      const unhandled = vi.fn<(reason: unknown) => void>();
      process.on('unhandledRejection', unhandled);
      fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

      reportClientError(createError('TypeError: x is undefined'));
      await vi.waitFor(() => {
        expect(fetchMock).toHaveBeenCalledOnce();
      });
      await new Promise((resolve) => {
        setTimeout(resolve, 0);
      });
      process.off('unhandledRejection', unhandled);

      expect(unhandled).not.toHaveBeenCalled();
    });
  });

  describe('エッジケース', () => {
    it('スタックは 4096 文字で切る', async () => {
      reportClientError(createError('a'.repeat(5000)));

      await vi.waitFor(() => {
        expect(fetchMock).toHaveBeenCalledOnce();
      });
      expect(sentRequest().body).toMatchObject([
        { body: { stack: 'a'.repeat(4096) } },
      ]);
    });
  });
});
