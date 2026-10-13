import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import app from './index';

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
