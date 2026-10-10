import { insertBlogFeedback } from './features/blog/infrastructure/feedback-repository';
import {
  findPublishedBlogId,
  incrementBlogView,
  incrementBlogViewDaily,
} from './features/blog/infrastructure/view-repository';
import { insertInquiry } from './features/inquiries/infrastructure/inquiry-repository';
import {
  deleteSubscription,
  insertSubscription,
} from './features/push-notification/infrastructure/subscription-repository';
import app from './index';

vi.mock('./features/blog/infrastructure/view-repository', () => ({
  findPublishedBlogId: vi.fn(),
  incrementBlogView: vi.fn(),
  incrementBlogViewDaily: vi.fn(),
}));
vi.mock('./features/blog/infrastructure/feedback-repository', () => ({
  insertBlogFeedback: vi.fn(),
}));
vi.mock('./features/inquiries/infrastructure/inquiry-repository', () => ({
  insertInquiry: vi.fn(),
  findInquiries: vi.fn(),
}));
vi.mock(
  './features/push-notification/infrastructure/subscription-repository',
  () => ({
    insertSubscription: vi.fn(),
    deleteSubscription: vi.fn(),
  }),
);
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

const sendJson = (
  path: string,
  body: unknown,
  {
    method = 'POST',
    origin = ORIGIN,
  }: { method?: string; origin?: string } = {},
) =>
  Promise.resolve(
    app.request(path, {
      method,
      headers: { Origin: origin, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  );

const P256DH = Buffer.concat([Buffer.from([0x04]), Buffer.alloc(64)]).toString(
  'base64url',
);
const AUTH = Buffer.alloc(16).toString('base64url');
const ENDPOINT = 'https://fcm.googleapis.com/fcm/send/abc123';

describe('公開 API', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.mocked(findPublishedBlogId).mockResolvedValue(7);
    vi.mocked(incrementBlogView).mockResolvedValue();
    vi.mocked(incrementBlogViewDaily).mockResolvedValue();
    vi.mocked(insertBlogFeedback).mockResolvedValue();
    vi.mocked(insertInquiry).mockResolvedValue();
    vi.mocked(insertSubscription).mockResolvedValue();
    vi.mocked(deleteSubscription).mockResolvedValue();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
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
          expect(res.headers.get('access-control-allow-methods')).toBe(
            'POST,DELETE',
          );
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

  describe('ローカルの main からの呼び出し', () => {
    describe('正常系', () => {
      it.each([
        'https://main.k8o.localhost',
        'https://main.k8o.localhost:1355',
        'https://api-dev-server.main.k8o.localhost:1355',
      ])('dev サーバーでは %s からの POST を通す', async (origin) => {
        vi.stubEnv('NODE_ENV', 'development');

        const res = await post(VIEWS_PATH, { Origin: origin });

        expect(res.status).toBe(204);
        expect(res.headers.get('access-control-allow-origin')).toBe(origin);
      });
    });

    describe('異常系', () => {
      it('dev サーバーでなければ、ローカルの main からの POST も 403 にする', async () => {
        vi.stubEnv('NODE_ENV', 'production');

        const res = await post(VIEWS_PATH, {
          Origin: 'https://main.k8o.localhost:1355',
        });

        expect(res.status).toBe(403);
      });

      it.each([
        'http://main.k8o.localhost:1355',
        'https://main.k8o.localhost.evil.example',
        'https://a.b.main.k8o.localhost:1355',
        'https://api.k8o.localhost:1355',
      ])(
        'dev サーバーでも、似せた Origin（%s）は 403 にする',
        async (origin) => {
          vi.stubEnv('NODE_ENV', 'development');

          const res = await post(VIEWS_PATH, { Origin: origin });

          expect(res.status).toBe(403);
          expect(res.headers.get('access-control-allow-origin')).toBeNull();
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

  describe('POST /public/inquiries', () => {
    describe('正常系', () => {
      it('お問い合わせを保存して 204 を返す', async () => {
        const res = await sendJson('/public/inquiries', {
          message: '質問です',
        });

        expect(res.status).toBe(204);
        expect(res.headers.get('access-control-allow-origin')).toBe(ORIGIN);
        expect(insertInquiry).toHaveBeenCalledWith('質問です');
      });

      it('JSON のプリフライトに Content-Type を許可して答える', async () => {
        const res = await app.request('/public/inquiries', {
          method: 'OPTIONS',
          headers: {
            Origin: ORIGIN,
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'content-type',
          },
        });

        expect(res.status).toBe(204);
        expect(res.headers.get('access-control-allow-headers')).toMatch(
          /content-type/iu,
        );
      });
    });

    describe('異常系', () => {
      it.each([
        ['空の本文', { message: '' }],
        ['256字の本文', { message: 'あ'.repeat(256) }],
        ['本文の無い', {}],
      ])('%sは 400 にして保存しない', async (_, body) => {
        const res = await sendJson('/public/inquiries', body);

        expect(res.status).toBe(400);
        expect(insertInquiry).not.toHaveBeenCalled();
      });

      it('Content-Type が JSON でなければ、本文が正しい JSON でも 400 にして保存しない', async () => {
        const res = await app.request('/public/inquiries', {
          method: 'POST',
          headers: { Origin: ORIGIN, 'Content-Type': 'text/plain' },
          body: JSON.stringify({ message: 'hi' }),
        });

        expect(res.status).toBe(400);
        expect(insertInquiry).not.toHaveBeenCalled();
      });

      it('許可していない Origin からのフォームと同じ形の POST は 403 にする', async () => {
        const res = await app.request('/public/inquiries', {
          method: 'POST',
          headers: {
            Origin: 'https://evil.example',
            'Content-Type': 'text/plain',
          },
          body: JSON.stringify({ message: 'hi' }),
        });

        expect(res.status).toBe(403);
        expect(insertInquiry).not.toHaveBeenCalled();
      });
    });

    describe('エッジケース', () => {
      it('255字ちょうどは受け付ける', async () => {
        const res = await sendJson('/public/inquiries', {
          message: 'あ'.repeat(255),
        });

        expect(res.status).toBe(204);
      });
    });
  });

  describe('POST /public/blogs/:slug/feedback', () => {
    const FEEDBACK_PATH = '/public/blogs/media-pseudos/feedback';

    describe('正常系', () => {
      it('評価とコメントを公開済みの記事に紐付けて保存する', async () => {
        const res = await sendJson(FEEDBACK_PATH, {
          feedbackId: 1,
          comment: '分かりやすかった',
        });

        expect(res.status).toBe(204);
        expect(findPublishedBlogId).toHaveBeenCalledWith('media-pseudos');
        expect(insertBlogFeedback).toHaveBeenCalledWith({
          blogId: 7,
          feedbackId: 1,
          message: '分かりやすかった',
        });
      });

      it('評価の無いコメントだけのフィードバックも受け付ける', async () => {
        const res = await sendJson(FEEDBACK_PATH, {
          feedbackId: null,
          comment: '続きが読みたい',
        });

        expect(res.status).toBe(204);
        expect(insertBlogFeedback).toHaveBeenCalledWith({
          blogId: 7,
          feedbackId: null,
          message: '続きが読みたい',
        });
      });

      it('評価だけのときはコメントを null で保存する', async () => {
        const res = await sendJson(FEEDBACK_PATH, {
          feedbackId: 2,
          comment: '',
        });

        expect(res.status).toBe(204);
        expect(insertBlogFeedback).toHaveBeenCalledWith({
          blogId: 7,
          feedbackId: 2,
          message: null,
        });
      });
    });

    describe('異常系', () => {
      it.each([
        ['評価もコメントも無い', { feedbackId: null, comment: '' }],
        ['画面に無い評価の', { feedbackId: 3, comment: '' }],
        ['501字のコメントの', { feedbackId: null, comment: 'あ'.repeat(501) }],
      ])('%sフィードバックは 400 にする', async (_, body) => {
        const res = await sendJson(FEEDBACK_PATH, body);

        expect(res.status).toBe(400);
        expect(insertBlogFeedback).not.toHaveBeenCalled();
      });

      it('公開済みの記事が無ければ 404 にする', async () => {
        vi.mocked(findPublishedBlogId).mockResolvedValue(null);

        const res = await sendJson(FEEDBACK_PATH, {
          feedbackId: 1,
          comment: '',
        });

        expect(res.status).toBe(404);
        expect(insertBlogFeedback).not.toHaveBeenCalled();
      });
    });

    describe('エッジケース', () => {
      it('500字ちょうどのコメントは受け付ける', async () => {
        const res = await sendJson(FEEDBACK_PATH, {
          feedbackId: null,
          comment: 'あ'.repeat(500),
        });

        expect(res.status).toBe(204);
      });
    });
  });

  describe('/public/push-subscriptions', () => {
    const PATH = '/public/push-subscriptions';

    describe('正常系', () => {
      it('購読を endpoint のホストと一緒に保存する', async () => {
        const res = await sendJson(PATH, {
          endpoint: ENDPOINT,
          keys: { p256dh: P256DH, auth: AUTH },
        });

        expect(res.status).toBe(204);
        expect(insertSubscription).toHaveBeenCalledWith({
          endpoint: ENDPOINT,
          endpointHost: 'fcm.googleapis.com',
          p256dh: P256DH,
          auth: AUTH,
        });
      });

      it('DELETE は endpoint と auth が一致する購読を消す', async () => {
        const res = await sendJson(
          PATH,
          { endpoint: ENDPOINT, auth: AUTH },
          { method: 'DELETE' },
        );

        expect(res.status).toBe(204);
        expect(deleteSubscription).toHaveBeenCalledWith(ENDPOINT, AUTH);
      });

      it('DELETE のプリフライトにメソッドを許可して答える', async () => {
        const res = await app.request(PATH, {
          method: 'OPTIONS',
          headers: {
            Origin: ORIGIN,
            'Access-Control-Request-Method': 'DELETE',
            'Access-Control-Request-Headers': 'content-type',
          },
        });

        expect(res.status).toBe(204);
        expect(res.headers.get('access-control-allow-methods')).toMatch(
          /DELETE/u,
        );
      });
    });

    describe('異常系', () => {
      it.each([
        [
          'Push サービスでない',
          'https://evil.example/push',
          'endpoint_not_allowed',
        ],
        [
          'https でない',
          'http://fcm.googleapis.com/fcm/send/abc',
          'endpoint_not_allowed',
        ],
      ])('%s endpoint は保存しない', async (_, endpoint, error) => {
        const res = await sendJson(PATH, {
          endpoint,
          keys: { p256dh: P256DH, auth: AUTH },
        });

        expect(res.status).toBe(400);
        await expect(res.json()).resolves.toStrictEqual({ ok: false, error });
        expect(insertSubscription).not.toHaveBeenCalled();
      });

      it('鍵の形が正しくなければ保存しない', async () => {
        const res = await sendJson(PATH, {
          endpoint: ENDPOINT,
          keys: { p256dh: AUTH, auth: AUTH },
        });

        expect(res.status).toBe(400);
        await expect(res.json()).resolves.toStrictEqual({
          ok: false,
          error: 'invalid_keys',
        });
      });

      it('長すぎる endpoint は、許可したホストでも形の誤りとして保存しない', async () => {
        const res = await sendJson(PATH, {
          endpoint: `${ENDPOINT}${'a'.repeat(2048)}`,
          keys: { p256dh: P256DH, auth: AUTH },
        });

        expect(res.status).toBe(400);
        await expect(res.json()).resolves.toStrictEqual({
          ok: false,
          error: 'invalid_request',
        });
      });

      it('endpoint と鍵の両方が誤っていれば、先に endpoint を確かめる', async () => {
        const res = await sendJson(PATH, {
          endpoint: 'https://evil.example/push',
          keys: { p256dh: AUTH, auth: AUTH },
        });

        await expect(res.json()).resolves.toStrictEqual({
          ok: false,
          error: 'endpoint_not_allowed',
        });
      });

      it('DELETE に auth が無ければ消さない', async () => {
        const res = await sendJson(
          PATH,
          { endpoint: ENDPOINT },
          { method: 'DELETE' },
        );

        expect(res.status).toBe(400);
        expect(deleteSubscription).not.toHaveBeenCalled();
      });
    });
  });
});
