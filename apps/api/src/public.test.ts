import {
  findPublishedBlogId,
  incrementBlogView,
  incrementBlogViewDaily,
} from './features/blog/infrastructure/view-repository';
import app from './index';

vi.mock('./features/blog/infrastructure/view-repository', () => ({
  findPublishedBlogId: vi.fn(),
  incrementBlogView: vi.fn(),
  incrementBlogViewDaily: vi.fn(),
}));
// cron と MCP は DB クライアントを読み込むため、このテストでは差し替える
vi.mock('./mcp', () => ({ mcpHandler: { fetch: vi.fn() } }));
vi.mock('./features/reading-list/interface/sync', () => ({
  runArticleSync: vi.fn(),
}));
vi.mock('./features/browser-support/interface/sync', () => ({
  runBrowserSupportSync: vi.fn(),
}));

const ORIGIN = 'https://k8o.me';
const VIEWS_PATH = '/public/blogs/media-pseudos/views';

const post = (path: string, headers: Record<string, string> = {}) =>
  Promise.resolve(app.request(path, { method: 'POST', headers }));

describe('公開 API', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.mocked(findPublishedBlogId).mockResolvedValue(7);
    vi.mocked(incrementBlogView).mockResolvedValue();
    vi.mocked(incrementBlogViewDaily).mockResolvedValue();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('CORS と CSRF', () => {
    describe('正常系', () => {
      it.each(['https://k8o.me', 'https://www.k8o.me'])(
        '%s からのプリフライトに、その Origin を許可して答える',
        async (origin) => {
          const res = await app.request(VIEWS_PATH, {
            method: 'OPTIONS',
            headers: {
              Origin: origin,
              'Access-Control-Request-Method': 'POST',
              'Access-Control-Request-Headers': 'content-type',
            },
          });

          expect(res.status).toBe(204);
          expect(res.headers.get('access-control-allow-origin')).toBe(origin);
          expect(res.headers.get('access-control-allow-headers')).toMatch(
            /content-type/iu,
          );
          expect(res.headers.get('access-control-max-age')).toBe('7200');
          expect(res.headers.get('access-control-allow-methods')).toBe('POST');
        },
      );

      it('ブラウザと同じく Sec-Fetch-Site: same-site を付けても、許可した Origin からの POST は通す', async () => {
        const res = await post(VIEWS_PATH, {
          Origin: 'https://www.k8o.me',
          'Sec-Fetch-Site': 'same-site',
        });

        expect(res.status).toBe(204);
      });

      it.each([
        ['OPTIONS', '/mcp'],
        ['OPTIONS', '/cron/sync-articles'],
        ['POST', '/cron/sync-articles'],
      ])(
        '%s %s には cors と csrf を掛けない（Bearer の認可で 401 になる）',
        async (method, path) => {
          const res = await app.request(path, {
            method,
            headers: {
              Origin: 'https://evil.example',
              'Access-Control-Request-Method': 'POST',
            },
          });

          expect(res.status).toBe(401);
          expect(res.headers.get('access-control-allow-origin')).toBeNull();
        },
      );
    });

    describe('異常系', () => {
      it('許可していない Origin のプリフライトには、Origin を許可しない', async () => {
        const res = await app.request(VIEWS_PATH, {
          method: 'OPTIONS',
          headers: {
            Origin: 'https://evil.example',
            'Access-Control-Request-Method': 'POST',
          },
        });

        expect(res.headers.get('access-control-allow-origin')).toBeNull();
      });

      it.each([
        ['許可していない Origin', { Origin: 'https://evil.example' }],
        ['Origin の無い', {}],
      ])(
        '%s からの本文の無い POST は 403 にして数えない',
        async (_, headers) => {
          const res = await post(VIEWS_PATH, headers);

          expect(res.status).toBe(403);
          expect(incrementBlogView).not.toHaveBeenCalled();
        },
      );
    });
  });

  describe('POST /public/blogs/:slug/views', () => {
    describe('正常系', () => {
      it('公開済みの記事を数えて 204 を返し、Origin を許可する', async () => {
        const res = await post(VIEWS_PATH, { Origin: ORIGIN });

        expect(res.status).toBe(204);
        expect(res.headers.get('access-control-allow-origin')).toBe(ORIGIN);
        expect(findPublishedBlogId).toHaveBeenCalledWith('media-pseudos');
        expect(incrementBlogView).toHaveBeenCalledWith(7);
      });
    });

    describe('異常系', () => {
      it('公開済みの記事が無ければ 404 を返す', async () => {
        vi.mocked(findPublishedBlogId).mockResolvedValue(null);

        const res = await post(VIEWS_PATH, { Origin: ORIGIN });

        expect(res.status).toBe(404);
        expect(res.headers.get('access-control-allow-origin')).toBe(ORIGIN);
        await expect(res.json()).resolves.toStrictEqual({
          ok: false,
          error: 'not_found',
        });
      });

      it('slug が長すぎれば 400 を返す', async () => {
        const res = await post(`/public/blogs/${'a'.repeat(201)}/views`, {
          Origin: ORIGIN,
        });

        expect(res.status).toBe(400);
        expect(res.headers.get('access-control-allow-origin')).toBe(ORIGIN);
        expect(findPublishedBlogId).not.toHaveBeenCalled();
        await expect(res.json()).resolves.toStrictEqual({
          ok: false,
          error: 'invalid_request',
        });
      });

      it('DB が失敗したら、中身を出さずに 500 を返す', async () => {
        vi.mocked(incrementBlogView).mockRejectedValue(new Error('db secret'));

        const res = await post(VIEWS_PATH, { Origin: ORIGIN });

        expect(res.status).toBe(500);
        expect(res.headers.get('access-control-allow-origin')).toBe(ORIGIN);
        await expect(res.json()).resolves.toStrictEqual({
          ok: false,
          error: 'internal_error',
        });
      });
    });

    describe('エッジケース', () => {
      it('本文の上限を超えたら 413 を返す', async () => {
        const res = await app.request(VIEWS_PATH, {
          method: 'POST',
          headers: { Origin: ORIGIN, 'Content-Type': 'text/plain' },
          body: 'a'.repeat(64 * 1024 + 1),
        });

        expect(res.status).toBe(413);
        expect(res.headers.get('access-control-allow-origin')).toBe(ORIGIN);
        expect(incrementBlogView).not.toHaveBeenCalled();
      });

      it('Content-Length で上限を超えると分かれば、本文を読まずに 413 を返す', async () => {
        const res = await app.request(VIEWS_PATH, {
          method: 'POST',
          headers: {
            Origin: ORIGIN,
            'Content-Type': 'text/plain',
            'Content-Length': String(64 * 1024 + 1),
          },
          body: 'a',
        });

        expect(res.status).toBe(413);
      });
    });
  });
});
