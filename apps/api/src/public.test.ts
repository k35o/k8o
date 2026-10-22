import type { BaselineDataset } from '@repo/helpers/baseline/model';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { insertBlogFeedback } from './features/blog/infrastructure/feedback-repository';
import {
  findPublishedBlogId,
  incrementBlogView,
  incrementBlogViewDaily,
} from './features/blog/infrastructure/view-repository';
import {
  findActiveDataset,
  findRecentFeatureChanges,
} from './features/browser-support/infrastructure/browser-support-repository';
import { insertInquiry } from './features/inquiries/infrastructure/inquiry-repository';
import { findPublicPushLogs } from './features/push-notification/infrastructure/push-log-repository';
import {
  deleteSubscription,
  insertSubscription,
} from './features/push-notification/infrastructure/subscription-repository';
import {
  findArticleSources,
  findRecentArticles,
} from './features/reading-list/infrastructure/reading-list-repository';
import { insertReports } from './features/reports/infrastructure/report-repository';
import app from './index';

vi.mock('./features/blog/infrastructure/view-repository', () => ({
  findPublishedBlogId: vi.fn(),
  incrementBlogView: vi.fn(),
  incrementBlogViewDaily: vi.fn(),
}));
vi.mock('./features/blog/infrastructure/feedback-repository', () => ({
  insertBlogFeedback: vi.fn(),
}));
vi.mock(
  './features/browser-support/infrastructure/browser-support-repository',
  () => ({
    findActiveDataset: vi.fn(),
    findRecentFeatureChanges: vi.fn(),
  }),
);
vi.mock('./features/inquiries/infrastructure/inquiry-repository', () => ({
  insertInquiry: vi.fn(),
  findInquiries: vi.fn(),
}));
vi.mock(
  './features/push-notification/infrastructure/push-log-repository',
  () => ({
    findPublicPushLogs: vi.fn(),
  }),
);
vi.mock(
  './features/push-notification/infrastructure/subscription-repository',
  () => ({
    insertSubscription: vi.fn(),
    deleteSubscription: vi.fn(),
  }),
);
vi.mock(
  './features/reading-list/infrastructure/reading-list-repository',
  () => ({
    findRecentArticles: vi.fn(),
    findArticleSources: vi.fn(),
  }),
);
vi.mock('./features/reports/infrastructure/report-repository', () => ({
  insertReports: vi.fn(),
  findReports: vi.fn(),
  findReportTypeCounts: vi.fn(),
}));
// cron・MCP・オーナー API は DB クライアントを読み込むため、このテストでは差し替える
vi.mock('./mcp', () => ({ mcpHandler: { fetch: vi.fn() } }));
vi.mock('./owner', async () => {
  const { Hono } = await import('hono');
  return { ownerRoutes: new Hono() };
});
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

// RFC 8291 の例にある受信側の公開鍵
const P256DH =
  'BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV-JvLexhqUzORcxaOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw4';
const AUTH = Buffer.alloc(16).toString('base64url');
const ENDPOINT = 'https://fcm.googleapis.com/fcm/send/abc123';

const DAILY_CACHE_CONTROL =
  'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400, stale-if-error=86400';

const ANCHOR_POSITIONING = {
  featureId: 'anchor-positioning',
  name: 'Anchor positioning',
  status: 'newly',
  baselineDate: '2026-04-01',
  resolvedDate: '2026-04-01',
  support: [{ browser: 'chrome', version: '125', date: '2024-05-14' }],
} as const satisfies BaselineDataset['features'][number];
const GRID = {
  featureId: 'grid',
  name: 'Grid',
  status: 'widely',
  baselineDate: '2020-01-15',
  resolvedDate: '2020-01-15',
  support: [{ browser: 'chrome', version: '57', date: '2017-03-09' }],
} as const satisfies BaselineDataset['features'][number];
const LIMITED_OLD = {
  featureId: 'limited-old',
  name: 'Limited old',
  status: 'limited',
  baselineDate: null,
  resolvedDate: '2024-01-15',
  support: [{ browser: 'chrome', version: '120', date: '2024-01-15' }],
} as const satisfies BaselineDataset['features'][number];
const ACTIVE_DATASET = {
  id: 3,
  upstreamVersion: '3.34.2',
  ingestedAt: '2026-07-19T06:00:00.000Z',
  dataset: {
    schemaVersion: 1,
    upstreamVersion: '3.34.2',
    features: [ANCHOR_POSITIONING, GRID, LIMITED_OLD],
    redirects: { 'old-grid': 'grid' },
    minVersions: { chrome: '120' },
  },
} satisfies NonNullable<Awaited<ReturnType<typeof findActiveDataset>>>;
const FEATURE_CHANGE = {
  featureId: 'anchor-positioning',
  featureName: 'Anchor positioning',
  status: 'newly',
  previousStatus: null,
  upstreamVersion: '3.34.2',
  changedAt: '2026-07-19T06:00:00.000Z',
} as const;

const SOURCE = {
  id: 1,
  title: 'Example & Blog',
  siteUrl: 'https://example.com',
};
const SUMMARIZED_ARTICLE = {
  id: 10,
  title: 'AI が要約した記事',
  url: 'https://example.com/a',
  publishedAt: '2026-07-18T09:00:00.000Z',
  imageUrl: 'https://example.com/a.png',
  description: '元記事の説明',
  summary: '要約 <b>',
  source: SOURCE,
};
const DESCRIBED_ARTICLE = {
  id: 11,
  title: '説明だけの記事',
  url: 'https://example.com/b?x=1&y=2',
  publishedAt: '2026-07-17T09:00:00.000Z',
  imageUrl: null,
  description: '元記事の説明',
  summary: null,
  source: SOURCE,
};
const BARE_ARTICLE = {
  id: 12,
  title: '説明も要約も無い記事',
  url: 'https://example.com/c',
  publishedAt: '2026-07-16T09:00:00.000Z',
  imageUrl: null,
  description: null,
  summary: null,
  source: SOURCE,
};

const PUSH_LOG = {
  id: 5,
  kind: 'readings_updated',
  title: 'Readings を更新しました',
  body: '3件の記事を追加しました',
  url: 'https://k8o.me/reading-list',
  sentAt: '2026-07-19T00:05:00.000Z',
} as const;

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
    vi.mocked(insertReports).mockResolvedValue();
    vi.mocked(findActiveDataset).mockResolvedValue(ACTIVE_DATASET);
    vi.mocked(findRecentFeatureChanges).mockResolvedValue([FEATURE_CHANGE]);
    vi.mocked(findRecentArticles).mockResolvedValue([
      SUMMARIZED_ARTICLE,
      DESCRIBED_ARTICLE,
      BARE_ARTICLE,
    ]);
    vi.mocked(findArticleSources).mockResolvedValue([
      { id: SOURCE.id, title: SOURCE.title },
    ]);
    vi.mocked(findPublicPushLogs).mockResolvedValue([PUSH_LOG]);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.useRealTimers();
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

      it('書き込みの応答は Origin ごとに変わるので、Vary に Origin を付ける', async () => {
        const res = await post(VIEWS_PATH, { Origin: ORIGIN });

        expect(res.status).toBe(204);
        expect(res.headers.get('vary')).toMatch(/Origin/u);
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

      it('長さが合っていても P-256 の点として読めない鍵は保存しない', async () => {
        const res = await sendJson(PATH, {
          endpoint: ENDPOINT,
          keys: {
            p256dh: Buffer.concat([
              Buffer.from([0x04]),
              Buffer.alloc(64),
            ]).toString('base64url'),
            auth: AUTH,
          },
        });

        expect(res.status).toBe(400);
        await expect(res.json()).resolves.toStrictEqual({
          ok: false,
          error: 'invalid_keys',
        });
        expect(insertSubscription).not.toHaveBeenCalled();
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
  describe('POST /public/reports', () => {
    const PATH = '/public/reports';
    const CSP_REPORT = {
      age: 12,
      type: 'csp-violation',
      url: 'https://k8o.me/blog/media-pseudos',
      user_agent: 'Mozilla/5.0',
      body: {
        documentURL: 'https://k8o.me/blog/media-pseudos',
        effectiveDirective: 'connect-src',
        blockedURL: 'https://evil.example/collect',
      },
    };

    // ブラウザの Reporting API が送る形（Origin は Chromium 134 より前だと付かない）
    const sendReports = (body: unknown, headers: Record<string, string> = {}) =>
      Promise.resolve(
        app.request(PATH, {
          method: 'POST',
          headers: { 'Content-Type': 'application/reports+json', ...headers },
          body: JSON.stringify(body),
        }),
      );

    describe('正常系', () => {
      it('Chromium と同じ形のプリフライトに、Origin と Content-Type を許可して答える', async () => {
        const res = await app.request(PATH, {
          method: 'OPTIONS',
          headers: {
            Origin: ORIGIN,
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'content-type',
          },
        });

        expect(res.status).toBe(204);
        expect(res.headers.get('access-control-allow-origin')).toBe(ORIGIN);
        expect(res.headers.get('access-control-allow-headers')).toMatch(
          /content-type/iu,
        );
      });

      it('application/reports+json のレポートを、種別・URL・本文だけ保存して 204 を返す', async () => {
        const res = await sendReports([CSP_REPORT], { Origin: ORIGIN });

        expect(res.status).toBe(204);
        expect(insertReports).toHaveBeenCalledWith([
          {
            type: 'csp-violation',
            url: 'https://k8o.me/blog/media-pseudos',
            body: CSP_REPORT.body,
          },
        ]);
      });

      it('Origin の無いレポートも受ける', async () => {
        const res = await sendReports([CSP_REPORT]);

        expect(res.status).toBe(204);
        expect(insertReports).toHaveBeenCalledOnce();
      });

      it('main のクライアントのエラーを application/json で受ける', async () => {
        const res = await sendJson(PATH, [
          {
            type: 'client-error',
            age: 0,
            url: 'https://k8o.me/',
            user_agent: 'Mozilla/5.0',
            body: { name: 'TypeError', message: 'x is undefined' },
          },
        ]);

        expect(res.status).toBe(204);
        expect(insertReports).toHaveBeenCalledWith([
          {
            type: 'client-error',
            url: 'https://k8o.me/',
            body: { name: 'TypeError', message: 'x is undefined' },
          },
        ]);
      });
    });

    describe('異常系', () => {
      it('許可していない Origin のプリフライトには、Origin を許可しない', async () => {
        const res = await app.request(PATH, {
          method: 'OPTIONS',
          headers: {
            Origin: 'https://evil.example',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'content-type',
          },
        });

        expect(res.headers.get('access-control-allow-origin')).toBeNull();
      });

      it('Reporting API の形でなければ 400 にして保存しない', async () => {
        const res = await sendReports([{ type: 'csp-violation' }]);

        expect(res.status).toBe(400);
        expect(insertReports).not.toHaveBeenCalled();
      });

      // Safari は CSP 違反を application/csp-report で送る。JSON 系の Content-Type でないので本文を読まない
      it('application/csp-report は本文を読まずに 400 にして保存しない', async () => {
        const res = await app.request(PATH, {
          method: 'POST',
          headers: {
            Origin: ORIGIN,
            'Content-Type': 'application/csp-report',
          },
          body: JSON.stringify({
            type: 'csp-violation',
            url: CSP_REPORT.url,
            body: CSP_REPORT.body,
          }),
        });

        expect(res.status).toBe(400);
        expect(insertReports).not.toHaveBeenCalled();
      });

      it('64KB を超える本文は 413 にして保存しない', async () => {
        const res = await sendReports([
          { ...CSP_REPORT, body: { sample: 'a'.repeat(64 * 1024) } },
        ]);

        expect(res.status).toBe(413);
        expect(insertReports).not.toHaveBeenCalled();
      });

      it.each([
        ['type が 65 字の', { type: 'a'.repeat(65) }],
        ['url が 2049 字の', { url: `https://k8o.me/${'a'.repeat(2034)}` }],
        ['user_agent が 513 字の', { user_agent: 'a'.repeat(513) }],
        [
          'body が JSON で 8193 字の',
          { body: { sample: 'a'.repeat(8193 - '{"sample":""}'.length) } },
        ],
      ])(
        '%sレポートは捨て、ほかのレポートだけを保存して 204 を返す',
        async (_, override) => {
          const res = await sendReports([
            { ...CSP_REPORT, ...override },
            CSP_REPORT,
          ]);

          expect(res.status).toBe(204);
          expect(insertReports).toHaveBeenCalledWith([
            {
              type: CSP_REPORT.type,
              url: CSP_REPORT.url,
              body: CSP_REPORT.body,
            },
          ]);
        },
      );

      it('51 件を送ったら、先頭の 50 件だけを保存して 204 を返す', async () => {
        const reports = Array.from({ length: 51 }, (_, i) => ({
          ...CSP_REPORT,
          url: `https://k8o.me/${i}`,
        }));

        const res = await sendReports(reports);

        expect(res.status).toBe(204);
        expect(insertReports).toHaveBeenCalledWith(
          reports.slice(0, 50).map(({ type, url, body }) => ({
            type,
            url,
            body,
          })),
        );
      });

      it('すべてが上限を超えていても 204 を返し、何も保存しない', async () => {
        const res = await sendReports([
          { ...CSP_REPORT, type: 'a'.repeat(65) },
        ]);

        expect(res.status).toBe(204);
        expect(insertReports).toHaveBeenCalledWith([]);
      });

      it('配列でなければ 400 にして保存しない', async () => {
        const res = await sendReports(CSP_REPORT);

        expect(res.status).toBe(400);
        expect(insertReports).not.toHaveBeenCalled();
      });

      // 410 はブラウザに送り先を消させるので返さない。保存の失敗は送り直してもらう
      it('保存に失敗したら 500 を返す', async () => {
        vi.mocked(insertReports).mockRejectedValue(new Error('db down'));

        const res = await sendReports([CSP_REPORT]);

        expect(res.status).toBe(500);
      });
    });

    describe('エッジケース', () => {
      it('空の配列は 204 を返す', async () => {
        const res = await sendReports([]);

        expect(res.status).toBe(204);
      });

      it('どの項目も上限ちょうどのレポートは保存する', async () => {
        const report = {
          ...CSP_REPORT,
          type: 'a'.repeat(64),
          url: `https://k8o.me/${'a'.repeat(2033)}`,
          user_agent: 'a'.repeat(512),
          body: { sample: 'a'.repeat(8192 - '{"sample":""}'.length) },
        };

        const res = await sendReports([report]);

        expect(res.status).toBe(204);
        expect(insertReports).toHaveBeenCalledWith([
          { type: report.type, url: report.url, body: report.body },
        ]);
      });
    });
  });

  describe('公開の GET', () => {
    const PATH = '/public/browser-support';

    describe('正常系', () => {
      it.each([
        ['許可していない Origin', { Origin: 'https://evil.example' }],
        ['Origin の無い', {}],
      ])(
        '%s からの GET にも * を返し、Vary に Origin を付けない',
        async (_, headers) => {
          const res = await app.request(PATH, { headers });

          expect(res.status).toBe(200);
          expect(res.headers.get('access-control-allow-origin')).toBe('*');
          expect(res.headers.get('vary')).toBeNull();
        },
      );

      it('HEAD は本文を返さず、GET と同じヘッダーを返す', async () => {
        const res = await app.request(PATH, {
          method: 'HEAD',
          headers: { Origin: ORIGIN },
        });

        expect(res.status).toBe(200);
        expect(res.headers.get('access-control-allow-origin')).toBe('*');
        expect(res.headers.get('cache-control')).toBe(DAILY_CACHE_CONTROL);
        await expect(res.text()).resolves.toBe('');
      });
    });

    describe('異常系', () => {
      it.each([
        ['GET', `${PATH}?v=1`],
        ['GET', `${PATH}?`],
        ['GET', `${PATH}/features/grid?v=1`],
        ['HEAD', `${PATH}?v=1`],
      ])(
        'query 付きの %s %s は、DB を読まずに 400 を返し、キャッシュさせない',
        async (method, path) => {
          const res = await app.request(path, { method });

          expect(res.status).toBe(400);
          expect(res.headers.get('cache-control')).toBe('no-store');
          expect(findActiveDataset).not.toHaveBeenCalled();
          expect(findRecentFeatureChanges).not.toHaveBeenCalled();
        },
      );

      it('query 付きの GET の 400 は、ほかの公開ルートと同じ形の JSON で返す', async () => {
        const res = await app.request(`${PATH}?v=1`);

        await expect(res.json()).resolves.toStrictEqual({
          ok: false,
          error: 'invalid_request',
        });
      });

      it('DB が失敗したら、中身を出さずに 500 を返し、キャッシュさせない', async () => {
        vi.mocked(findActiveDataset).mockRejectedValue(new Error('db secret'));

        const res = await app.request(PATH);

        expect(res.status).toBe(500);
        expect(res.headers.get('cache-control')).toBe('no-store');
        await expect(res.json()).resolves.toStrictEqual({
          ok: false,
          error: 'internal_error',
        });
      });

      it('未定義のパスの 404 はキャッシュさせない', async () => {
        const res = await app.request('/public/unknown');

        expect(res.status).toBe(404);
        expect(res.headers.get('cache-control')).toBe('no-store');
      });
    });
  });

  describe('GET /public/browser-support', () => {
    const PATH = '/public/browser-support';

    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date('2026-07-20T00:00:00.000Z'));
    });

    describe('正常系', () => {
      it('いまの時刻で選んだ機能と、直近30日の更新を返す', async () => {
        const res = await app.request(PATH);

        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toStrictEqual({
          meta: {
            upstreamVersion: '3.34.2',
            ingestedAt: '2026-07-19T06:00:00.000Z',
          },
          features: [ANCHOR_POSITIONING, GRID],
          recentChanges: [FEATURE_CHANGE],
          nowMs: 1_784_505_600_000,
        });
        expect(findRecentFeatureChanges).toHaveBeenCalledWith(
          '2026-06-20T00:00:00.000Z',
          100,
        );
      });

      it('CDN に1時間持たせ、DB が落ちても古い値を返させる', async () => {
        const res = await app.request(PATH);

        expect(res.headers.get('cache-control')).toBe(DAILY_CACHE_CONTROL);
      });
    });

    describe('エッジケース', () => {
      it('同期前で active のデータが無くても、更新の履歴は返す', async () => {
        vi.mocked(findActiveDataset).mockResolvedValue(null);

        const res = await app.request(PATH);

        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toStrictEqual({
          meta: null,
          features: [],
          recentChanges: [FEATURE_CHANGE],
          nowMs: 1_784_505_600_000,
        });
      });
    });
  });

  describe('GET /public/browser-support/features/:featureId', () => {
    const PATH = '/public/browser-support/features';

    describe('正常系', () => {
      it('機能の状態を返す', async () => {
        const res = await app.request(`${PATH}/grid`);

        expect(res.status).toBe(200);
        expect(res.headers.get('cache-control')).toBe(DAILY_CACHE_CONTROL);
        await expect(res.json()).resolves.toStrictEqual({ feature: GRID });
      });

      it('旧い ID は redirects で今の機能に解決する', async () => {
        const res = await app.request(`${PATH}/old-grid`);

        await expect(res.json()).resolves.toStrictEqual({ feature: GRID });
      });
    });

    describe('異常系', () => {
      it.each([
        ['データに無い ID', 'unknown-feature', ACTIVE_DATASET],
        ['同期前の', 'grid', null],
      ])(
        '%sは 404 を返し、200 と同じだけキャッシュさせる',
        async (_, featureId, active) => {
          vi.mocked(findActiveDataset).mockResolvedValue(active);

          const res = await app.request(`${PATH}/${featureId}`);

          expect(res.status).toBe(404);
          expect(res.headers.get('cache-control')).toBe(DAILY_CACHE_CONTROL);
          await expect(res.json()).resolves.toStrictEqual({
            ok: false,
            error: 'not_found',
          });
        },
      );

      it.each([
        ['大文字を含む', 'Grid'],
        ['_ を含む', 'a_b'],
        ['ASCII でない', encodeURIComponent('あ')],
        ['101字の', 'a'.repeat(101)],
      ])(
        '%s ID は DB を読まずに 400 を返し、キャッシュさせない',
        async (_, featureId) => {
          const res = await app.request(`${PATH}/${featureId}`);

          expect(res.status).toBe(400);
          expect(res.headers.get('cache-control')).toBe('no-store');
          expect(findActiveDataset).not.toHaveBeenCalled();
          await expect(res.json()).resolves.toStrictEqual({
            ok: false,
            error: 'invalid_request',
          });
        },
      );
    });

    describe('エッジケース', () => {
      it('100字の ID は受け付けて DB を読む', async () => {
        const res = await app.request(`${PATH}/${'a'.repeat(100)}`);

        expect(res.status).toBe(404);
        expect(findActiveDataset).toHaveBeenCalledOnce();
      });
    });
  });

  describe('GET /public/reading-list', () => {
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date('2026-07-20T00:00:00.000Z'));
    });

    describe('正常系', () => {
      it('直近90日の記事とソースの一覧を返す', async () => {
        const res = await app.request('/public/reading-list');

        expect(res.status).toBe(200);
        expect(res.headers.get('cache-control')).toBe(DAILY_CACHE_CONTROL);
        await expect(res.json()).resolves.toStrictEqual({
          articles: [SUMMARIZED_ARTICLE, DESCRIBED_ARTICLE, BARE_ARTICLE],
          sources: [{ id: 1, title: 'Example & Blog' }],
        });
        expect(findRecentArticles).toHaveBeenCalledWith(
          '2026-04-21T00:00:00.000Z',
        );
      });
    });

    describe('異常系', () => {
      it('query 付きの GET は、フィードと違って戻さずに 400 を返す', async () => {
        const res = await app.request('/public/reading-list?v=1');

        expect(res.status).toBe(400);
        expect(findRecentArticles).not.toHaveBeenCalled();
      });
    });
  });

  describe('GET /public/reading-list/feed', () => {
    const PATH = '/public/reading-list/feed';

    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date('2026-07-20T00:00:00.000Z'));
    });

    describe('正常系', () => {
      it('直近90日の記事を、self を k8o.me の URL にした RSS で返し、AI の要約にだけ【AI要約】を付ける', async () => {
        const res = await app.request(PATH);

        expect(res.status).toBe(200);
        expect(res.headers.get('content-type')).toBe(
          'application/rss+xml; charset=utf-8',
        );
        expect(res.headers.get('cache-control')).toBe(DAILY_CACHE_CONTROL);
        await expect(res.text()).resolves.toBe(
          '<?xml version="1.0" encoding="UTF-8"?>' +
            '<rss xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">' +
            '<channel>' +
            '<title>k8o Readings</title>' +
            '<description>気になっている記事を集めて、あとから探せるようにしています。</description>' +
            '<link>https://k8o.me/reading-list</link>' +
            '<atom:link href="https://k8o.me/reading-list/feed" rel="self" type="application/rss+xml"/>' +
            '<language>ja</language>' +
            '<item>' +
            '<title>AI が要約した記事</title>' +
            '<description>【AI要約】要約 &lt;b&gt;</description>' +
            '<link>https://example.com/a</link>' +
            '<guid isPermaLink="false">https://example.com/a</guid>' +
            '<category>Example &amp; Blog</category>' +
            '<pubDate>Sat, 18 Jul 2026 09:00:00 GMT</pubDate>' +
            '</item>' +
            '<item>' +
            '<title>説明だけの記事</title>' +
            '<description>元記事の説明</description>' +
            '<link>https://example.com/b?x=1&amp;y=2</link>' +
            '<guid isPermaLink="false">https://example.com/b?x=1&amp;y=2</guid>' +
            '<category>Example &amp; Blog</category>' +
            '<pubDate>Fri, 17 Jul 2026 09:00:00 GMT</pubDate>' +
            '</item>' +
            '<item>' +
            '<title>説明も要約も無い記事</title>' +
            '<link>https://example.com/c</link>' +
            '<guid isPermaLink="false">https://example.com/c</guid>' +
            '<category>Example &amp; Blog</category>' +
            '<pubDate>Thu, 16 Jul 2026 09:00:00 GMT</pubDate>' +
            '</item>' +
            '</channel>' +
            '</rss>',
        );
        expect(findRecentArticles).toHaveBeenCalledWith(
          '2026-04-21T00:00:00.000Z',
        );
      });
    });

    describe('エッジケース', () => {
      it('直近90日に記事が無くても、channel だけのフィードを返す', async () => {
        vi.mocked(findRecentArticles).mockResolvedValue([]);

        const res = await app.request(PATH);

        expect(res.status).toBe(200);
        const xml = await res.text();
        expect(xml).toContain('<title>k8o Readings</title>');
        expect(xml).not.toContain('<item>');
      });

      it.each([
        ['GET', `${PATH}?utm_source=x`],
        ['GET', `${PATH}?`],
        ['HEAD', `${PATH}?utm_source=x`],
      ])(
        'query 付きの %s %s は、DB を読まずに query の無い k8o.me のフィードの URL へ 308 で戻す',
        async (method, path) => {
          const res = await app.request(path, { method });

          expect(res.status).toBe(308);
          expect(res.headers.get('location')).toBe(
            'https://k8o.me/reading-list/feed',
          );
          expect(res.headers.get('cache-control')).toBe(DAILY_CACHE_CONTROL);
          expect(findRecentArticles).not.toHaveBeenCalled();
        },
      );
    });
  });

  describe('GET /public/push-logs', () => {
    describe('正常系', () => {
      it('50件を上限に読んだ通知の履歴を返し、CDN に10分置く', async () => {
        const res = await app.request('/public/push-logs');

        expect(res.status).toBe(200);
        expect(res.headers.get('cache-control')).toBe(
          'public, max-age=60, s-maxage=600, stale-while-revalidate=86400, stale-if-error=86400',
        );
        await expect(res.json()).resolves.toStrictEqual({ logs: [PUSH_LOG] });
        expect(findPublicPushLogs).toHaveBeenCalledWith(50);
      });
    });
  });
});
