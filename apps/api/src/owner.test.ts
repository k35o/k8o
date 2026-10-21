import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { findBlogs } from './features/blog/infrastructure/blog-repository';
import { findInquiries } from './features/inquiries/infrastructure/inquiry-repository';
import { findOverview } from './features/overview/infrastructure/overview-repository';
import { getSummaryProgress } from './features/reading-list/interface/queries';
import {
  findReports,
  findReportTypeCounts,
} from './features/reports/infrastructure/report-repository';
import app from './index';

vi.mock('./features/blog/infrastructure/blog-repository', () => ({
  findBlogs: vi.fn(),
}));
vi.mock('./features/inquiries/infrastructure/inquiry-repository', () => ({
  findInquiries: vi.fn(),
}));
vi.mock('./features/overview/infrastructure/overview-repository', () => ({
  findOverview: vi.fn(),
}));
vi.mock('./features/reading-list/interface/queries', () => ({
  getSummaryProgress: vi.fn(),
}));
vi.mock('./features/reports/infrastructure/report-repository', () => ({
  findReports: vi.fn(),
  findReportTypeCounts: vi.fn(),
}));
// MCP・cron・公開ルートは DB クライアントを読み込むため、このテストでは差し替える
vi.mock('./mcp', () => ({ mcpHandler: { fetch: vi.fn() } }));
vi.mock('./features/reading-list/interface/sync', () => ({
  runArticleSync: vi.fn(),
}));
vi.mock('./features/browser-support/interface/sync', () => ({
  runBrowserSupportSync: vi.fn(),
}));
vi.mock('./public', async () => {
  const { Hono } = await import('hono');
  return { publicRoutes: new Hono() };
});

const AI_TOKEN = 'owner-ai';
const AI_PREVIEW_TOKEN = 'owner-ai-preview';

// フォーマッタがエスケープを実際の不可視文字に戻してしまうため、コードポイントで組み立てる
const ZERO_WIDTH_SPACE = String.fromCodePoint(0x20_0b);

const FEED = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>k8o Blog</title><link>https://k8o.me/blog</link>
<item>
  <title>ariaNotify()でスクリーンリーダーに任意の文字列を読み上げさせる</title>
  <description>ariaNotify()は、DOMを書き換えずに読み上げさせるメソッドです。</description>
  <link>https://k8o.me/blog/arianotify</link>
  <category>a11y</category>
  <category>JavaScript</category>
  <pubDate>Mon, 28 Sep 2026 00:00:00 GMT</pubDate>
</item>
<item>
  <title>requestClose()でダイアログに閉じるよう求める</title>
  <description>requestCloseメソッドは&lt;dialog&gt;要素を閉じるように要求します。</description>
  <link>https://k8o.me/blog/requestclose</link>
  <pubDate>Tue, 29 Sep 2026 00:00:00 GMT</pubDate>
</item>
<item>
  <title>よそのサイトの記事</title>
  <description>k8o.me のブログではない</description>
  <link>https://example.com/blog/other</link>
</item>
</channel></rss>`;

const fetchMock = vi.fn<typeof fetch>();

const ownerRequest = (path: string, token?: string): Promise<Response> =>
  Promise.resolve(
    app.request(path, {
      headers: token === undefined ? {} : { Authorization: `Bearer ${token}` },
    }),
  );

beforeEach(() => {
  vi.stubEnv('OWNER_API_TOKEN_AI', AI_TOKEN);
  vi.stubEnv('OWNER_API_TOKEN_AI_PREVIEW', AI_PREVIEW_TOKEN);
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockReset();
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('オーナー API の認可', () => {
  describe('正常系', () => {
    it.each([
      ['ai の本番', AI_TOKEN],
      ['ai の preview', AI_PREVIEW_TOKEN],
    ])('%s のトークンなら通す', async (_, token) => {
      fetchMock.mockResolvedValue(new Response('# 本文'));

      const res = await ownerRequest('/owner/blogs/arianotify', token);

      expect(res.status).toBe(200);
    });
  });

  describe('異常系', () => {
    it('Authorization が無ければ 401 を返し、main を呼ばない', async () => {
      const res = await ownerRequest('/owner/blogs');

      expect(res.status).toBe(401);
      await expect(res.json()).resolves.toStrictEqual({ ok: false });
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it.each([
      ['/owner/overview', findOverview],
      ['/owner/inquiries?page=1&pageSize=20', findInquiries],
      [
        '/owner/blog-stats?status=all&sort=recent&page=1&pageSize=20',
        findBlogs,
      ],
      ['/owner/reports?page=1&pageSize=10', findReports],
    ])(
      'Authorization が無ければ %s も 401 を返し、DB を読まない',
      async (path, read) => {
        const res = await ownerRequest(path);

        expect(res.status).toBe(401);
        expect(read).not.toHaveBeenCalled();
      },
    );

    it('どのクライアントのトークンとも違えば 401 を返す', async () => {
      const res = await ownerRequest('/owner/blogs', 'wrong');

      expect(res.status).toBe(401);
    });

    it('MCP 用の MCP_TOKEN では 401 を返す', async () => {
      vi.stubEnv('MCP_TOKEN', 'mcp-token');

      const res = await ownerRequest('/owner/blogs', 'mcp-token');

      expect(res.status).toBe(401);
    });
  });

  describe('エッジケース', () => {
    it('preview のトークンが未設定でも、本番のトークンは通す', async () => {
      vi.stubEnv('OWNER_API_TOKEN_AI_PREVIEW', '');
      fetchMock.mockResolvedValue(new Response('# 本文'));

      const res = await ownerRequest('/owner/blogs/arianotify', AI_TOKEN);

      expect(res.status).toBe(200);
    });

    it('トークンがどれも未設定なら、空の Bearer も通さない', async () => {
      vi.stubEnv('OWNER_API_TOKEN_AI', '');
      vi.stubEnv('OWNER_API_TOKEN_AI_PREVIEW', '');

      const res = await ownerRequest('/owner/blogs', '');

      expect(res.status).toBe(401);
    });
  });
});

describe('GET /owner/blogs', () => {
  describe('正常系', () => {
    it('main のブログのフィードを記事の一覧にして返す', async () => {
      fetchMock.mockResolvedValue(new Response(FEED));

      const res = await ownerRequest('/owner/blogs', AI_TOKEN);

      expect(res.status).toBe(200);
      expect(fetchMock.mock.calls[0]?.[0]).toBe('https://k8o.me/blog/feed');
      await expect(res.json()).resolves.toStrictEqual({
        items: [
          {
            slug: 'arianotify',
            title:
              'ariaNotify()でスクリーンリーダーに任意の文字列を読み上げさせる',
            description:
              'ariaNotify()は、DOMを書き換えずに読み上げさせるメソッドです。',
            tags: ['a11y', 'JavaScript'],
            publishedAt: '2026-09-28T00:00:00.000Z',
            url: 'https://k8o.me/blog/arianotify',
          },
          {
            slug: 'requestclose',
            title: 'requestClose()でダイアログに閉じるよう求める',
            description:
              'requestCloseメソッドは<dialog>要素を閉じるように要求します。',
            tags: [],
            publishedAt: '2026-09-29T00:00:00.000Z',
            url: 'https://k8o.me/blog/requestclose',
          },
        ],
      });
    });
  });

  describe('異常系', () => {
    it('フィードを取れなければ 500 を返す', async () => {
      fetchMock.mockResolvedValue(new Response('error', { status: 503 }));

      const res = await ownerRequest('/owner/blogs', AI_TOKEN);

      expect(res.status).toBe(500);
      await expect(res.json()).resolves.toStrictEqual({
        ok: false,
        error: 'internal_error',
      });
    });
  });
});

describe('GET /owner/blogs/:slug', () => {
  describe('正常系', () => {
    it('main から取った記事の markdown を返す', async () => {
      fetchMock.mockResolvedValue(new Response('# ariaNotify()\n\n本文'));

      const res = await ownerRequest('/owner/blogs/arianotify', AI_TOKEN);

      expect(res.status).toBe(200);
      expect(fetchMock.mock.calls[0]?.[0]).toBe(
        'https://k8o.me/blog/arianotify.md',
      );
      await expect(res.json()).resolves.toStrictEqual({
        slug: 'arianotify',
        markdown: '# ariaNotify()\n\n本文',
      });
    });
  });

  describe('異常系', () => {
    it('main に記事が無ければ 404 を返す', async () => {
      fetchMock.mockResolvedValue(new Response('Not Found', { status: 404 }));

      const res = await ownerRequest('/owner/blogs/missing', AI_TOKEN);

      expect(res.status).toBe(404);
      await expect(res.json()).resolves.toStrictEqual({
        ok: false,
        error: 'not_found',
      });
    });

    it('main が 404 以外で失敗したら 500 を返す', async () => {
      fetchMock.mockResolvedValue(new Response('error', { status: 500 }));

      const res = await ownerRequest('/owner/blogs/arianotify', AI_TOKEN);

      expect(res.status).toBe(500);
    });

    it.each(['Uppercase', 'a.b', '..%2Ffeed', 'a%2Fb'])(
      'slug "%s" は 400 を返し、main を呼ばない',
      async (slug) => {
        const res = await ownerRequest(`/owner/blogs/${slug}`, AI_TOKEN);

        expect(res.status).toBe(400);
        expect(fetchMock).not.toHaveBeenCalled();
      },
    );
  });
});

describe('GET /owner/overview', () => {
  describe('正常系', () => {
    it('DB の集計に、reading-list の要約の進み具合を足して返す', async () => {
      vi.mocked(findOverview).mockResolvedValue({
        blogs: { published: 90, drafts: 1, totalViews: 1234 },
        inquiries: { total: 3, latestAt: '2026-10-07T00:00:00.000Z' },
        push: {
          subscribers: 5,
          lastSentAt: '2026-10-08T00:01:00.000Z',
          lastSucceeded: 5,
          lastFailed: 0,
        },
        readingList: {
          articles: 300,
          sources: 12,
          latestPublishedAt: '2026-10-08T00:00:00.000Z',
        },
        browserSupport: {
          activeVersion: '3.40.1',
          activeIngestedAt: '2026-10-08T14:40:34.555Z',
          lastRun: {
            result: 'applied',
            trigger: 'manual',
            createdAt: '2026-10-08T14:40:36.027Z',
          },
        },
      });
      vi.mocked(getSummaryProgress).mockResolvedValue({
        unsummarized: 20,
        summaryGaveUp: 2,
      });

      const res = await ownerRequest('/owner/overview', AI_TOKEN);

      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toStrictEqual({
        blogs: { published: 90, drafts: 1, totalViews: 1234 },
        inquiries: { total: 3, latestAt: '2026-10-07T00:00:00.000Z' },
        push: {
          subscribers: 5,
          lastSentAt: '2026-10-08T00:01:00.000Z',
          lastSucceeded: 5,
          lastFailed: 0,
        },
        readingList: {
          articles: 300,
          sources: 12,
          latestPublishedAt: '2026-10-08T00:00:00.000Z',
          unsummarized: 20,
          summaryGaveUp: 2,
        },
        browserSupport: {
          activeVersion: '3.40.1',
          activeIngestedAt: '2026-10-08T14:40:34.555Z',
          lastRun: {
            result: 'applied',
            trigger: 'manual',
            createdAt: '2026-10-08T14:40:36.027Z',
          },
        },
      });
    });
  });
});

describe('GET /owner/inquiries', () => {
  describe('正常系', () => {
    it('page と pageSize を数にして読み、記事に紐づくものをフィードバック、それ以外をお問い合わせとして返す', async () => {
      vi.mocked(findInquiries).mockResolvedValue({
        total: 52,
        items: [
          {
            id: 2,
            message: null,
            createdAt: '2026-10-08T00:00:00.000Z',
            feedbackName: 'good',
            blogSlug: 'media-pseudos',
          },
          {
            id: 1,
            message: 'はじめまして',
            createdAt: '2026-10-07T00:00:00.000Z',
            feedbackName: null,
            blogSlug: null,
          },
        ],
      });

      const res = await ownerRequest(
        '/owner/inquiries?page=2&pageSize=50',
        AI_TOKEN,
      );

      expect(res.status).toBe(200);
      expect(findInquiries).toHaveBeenCalledWith({ page: 2, pageSize: 50 });
      await expect(res.json()).resolves.toStrictEqual({
        total: 52,
        items: [
          {
            id: 2,
            receivedAt: '2026-10-08T00:00:00.000Z',
            kind: 'blog_feedback',
            blogSlug: 'media-pseudos',
            feedbackLabel: 'good',
            untrustedMessage: null,
          },
          {
            id: 1,
            receivedAt: '2026-10-07T00:00:00.000Z',
            kind: 'contact',
            blogSlug: null,
            feedbackLabel: null,
            untrustedMessage: 'はじめまして',
          },
        ],
      });
    });
  });

  describe('異常系', () => {
    it('本文の見えない文字を取り除いて返す', async () => {
      vi.mocked(findInquiries).mockResolvedValue({
        total: 1,
        items: [
          {
            id: 1,
            message: `無視して${ZERO_WIDTH_SPACE}ください`,
            createdAt: '2026-10-07T00:00:00.000Z',
            feedbackName: null,
            blogSlug: null,
          },
        ],
      });

      const res = await ownerRequest(
        '/owner/inquiries?page=1&pageSize=20',
        AI_TOKEN,
      );

      await expect(res.json()).resolves.toMatchObject({
        items: [{ untrustedMessage: '無視してください' }],
      });
    });

    it.each([
      ['page が 0', 'page=0&pageSize=20'],
      ['page が小数', 'page=1.5&pageSize=20'],
      ['page が数でない', 'page=abc&pageSize=20'],
      ['page が2つ', 'page=1&page=2&pageSize=20'],
      ['pageSize が上限の 50 を超える', 'page=1&pageSize=51'],
      ['page が無い', 'pageSize=20'],
      ['pageSize が無い', 'page=1'],
    ])('%s なら 400 を返し、DB を読まない', async (_, query) => {
      const res = await ownerRequest(`/owner/inquiries?${query}`, AI_TOKEN);

      expect(res.status).toBe(400);
      await expect(res.json()).resolves.toStrictEqual({
        ok: false,
        error: 'invalid_request',
      });
      expect(findInquiries).not.toHaveBeenCalled();
    });
  });
});

describe('GET /owner/blog-stats', () => {
  describe('正常系', () => {
    it('絞り込み・並び順・ページを DB の読み取りに渡し、結果をそのまま返す', async () => {
      const blogs = {
        total: 51,
        items: [
          {
            slug: 'media-pseudos',
            published: false,
            createdAt: '2026-09-09T00:00:00.000Z',
            views: 0,
            feedbackCount: 1,
            tags: ['CSS'],
          },
        ],
      };
      vi.mocked(findBlogs).mockResolvedValue(blogs);

      const res = await ownerRequest(
        '/owner/blog-stats?status=draft&sort=views&page=2&pageSize=50',
        AI_TOKEN,
      );

      expect(res.status).toBe(200);
      expect(findBlogs).toHaveBeenCalledWith({
        status: 'draft',
        sort: 'views',
        page: 2,
        pageSize: 50,
      });
      await expect(res.json()).resolves.toStrictEqual(blogs);
    });
  });

  describe('異常系', () => {
    it.each([
      ['status が組の外', 'status=archived&sort=recent&page=1&pageSize=20'],
      ['sort が組の外', 'status=all&sort=title&page=1&pageSize=20'],
      [
        'pageSize が上限の 50 を超える',
        'status=all&sort=recent&page=1&pageSize=51',
      ],
      ['page が 0', 'status=all&sort=recent&page=0&pageSize=20'],
      ['status が無い', 'sort=recent&page=1&pageSize=20'],
      ['sort が無い', 'status=all&page=1&pageSize=20'],
    ])('%s なら 400 を返し、DB を読まない', async (_, query) => {
      const res = await ownerRequest(`/owner/blog-stats?${query}`, AI_TOKEN);

      expect(res.status).toBe(400);
      await expect(res.json()).resolves.toStrictEqual({
        ok: false,
        error: 'invalid_request',
      });
      expect(findBlogs).not.toHaveBeenCalled();
    });
  });
});

describe('GET /owner/reports', () => {
  describe('正常系', () => {
    it('種別ごとの件数と、種別で絞った一覧を、本文を JSON の文字列にして返す', async () => {
      vi.mocked(findReportTypeCounts).mockResolvedValue([
        { type: 'csp-violation', count: 21 },
        { type: 'client-error', count: 3 },
      ]);
      vi.mocked(findReports).mockResolvedValue([
        {
          id: 1,
          type: 'csp-violation',
          url: 'https://k8o.me/',
          body: { blockedURL: 'inline' },
          createdAt: '2026-10-08T00:00:00.000Z',
        },
      ]);

      const res = await ownerRequest(
        '/owner/reports?type=csp-violation&page=2&pageSize=20',
        AI_TOKEN,
      );

      expect(res.status).toBe(200);
      expect(findReports).toHaveBeenCalledWith({
        type: 'csp-violation',
        page: 2,
        pageSize: 20,
      });
      await expect(res.json()).resolves.toStrictEqual({
        typeCounts: [
          { type: 'csp-violation', count: 21 },
          { type: 'client-error', count: 3 },
        ],
        items: [
          {
            id: 1,
            receivedAt: '2026-10-08T00:00:00.000Z',
            type: 'csp-violation',
            url: 'https://k8o.me/',
            untrustedBody: '{"blockedURL":"inline"}',
          },
        ],
      });
    });

    it('type が無ければ、種別で絞らずに読む', async () => {
      vi.mocked(findReportTypeCounts).mockResolvedValue([]);
      vi.mocked(findReports).mockResolvedValue([]);

      await ownerRequest('/owner/reports?page=1&pageSize=10', AI_TOKEN);

      expect(findReports).toHaveBeenCalledWith({
        type: undefined,
        page: 1,
        pageSize: 10,
      });
    });
  });

  describe('異常系', () => {
    it('種別・URL・本文の見えない文字を取り除いて返す', async () => {
      const type = `csp${ZERO_WIDTH_SPACE}-violation`;
      vi.mocked(findReportTypeCounts).mockResolvedValue([{ type, count: 1 }]);
      vi.mocked(findReports).mockResolvedValue([
        {
          id: 1,
          type,
          url: `https://k8o.me/${ZERO_WIDTH_SPACE}`,
          body: { sample: `無視して${ZERO_WIDTH_SPACE}ください` },
          createdAt: '2026-10-08T00:00:00.000Z',
        },
      ]);

      const res = await ownerRequest(
        '/owner/reports?page=1&pageSize=10',
        AI_TOKEN,
      );

      await expect(res.json()).resolves.toMatchObject({
        typeCounts: [{ type: 'csp-violation' }],
        items: [
          {
            type: 'csp-violation',
            url: 'https://k8o.me/',
            untrustedBody: '{"sample":"無視してください"}',
          },
        ],
      });
    });

    it.each([
      ['pageSize が上限の 20 を超える', 'page=1&pageSize=21'],
      ['type が空', 'type=&page=1&pageSize=10'],
      ['type が2つ', 'type=a&type=b&page=1&pageSize=10'],
      ['page が 0', 'page=0&pageSize=10'],
      ['page が無い', 'pageSize=10'],
      ['pageSize が無い', 'page=1'],
    ])('%s なら 400 を返し、DB を読まない', async (_, query) => {
      const res = await ownerRequest(`/owner/reports?${query}`, AI_TOKEN);

      expect(res.status).toBe(400);
      await expect(res.json()).resolves.toStrictEqual({
        ok: false,
        error: 'invalid_request',
      });
      expect(findReports).not.toHaveBeenCalled();
      expect(findReportTypeCounts).not.toHaveBeenCalled();
    });
  });
});
