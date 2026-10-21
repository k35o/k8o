import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  fetchOwnerBlogMarkdown,
  fetchOwnerBlogs,
  fetchOwnerBlogStats,
  fetchOwnerInquiries,
  fetchOwnerOverview,
} from './owner-api';

vi.mock('server-only', () => ({}));

const TOKEN = 'owner-ai';

const BLOG = {
  slug: 'arianotify',
  title: 'ariaNotify()でスクリーンリーダーに任意の文字列を読み上げさせる',
  description: 'ariaNotify()は、DOMを書き換えずに読み上げさせるメソッドです。',
  tags: ['a11y', 'JavaScript'],
  publishedAt: '2026-09-28T00:00:00.000Z',
  url: 'https://k8o.me/blog/arianotify',
};

const OVERVIEW = {
  blogs: { published: 42, drafts: 3, totalViews: 12_345 },
  inquiries: { total: 21, latestAt: '2026-10-20T09:00:00.000Z' },
  push: {
    subscribers: 8,
    lastSentAt: '2026-10-19T00:00:00.000Z',
    lastSucceeded: 7,
    lastFailed: 1,
  },
  readingList: {
    articles: 300,
    sources: 12,
    latestPublishedAt: '2026-10-20T00:00:00.000Z',
    unsummarized: 13,
    summaryGaveUp: 2,
  },
  browserSupport: {
    activeVersion: '7.1.0',
    activeIngestedAt: '2026-10-20T06:00:00.000Z',
    lastRun: {
      result: 'applied',
      trigger: 'cron',
      createdAt: '2026-10-20T06:00:00.000Z',
    },
  },
};

const INQUIRY_PAGE = {
  total: 21,
  items: [
    {
      id: 7,
      receivedAt: '2026-10-20T09:00:00.000Z',
      kind: 'contact',
      blogSlug: null,
      feedbackLabel: null,
      untrustedMessage: '記事の誤字を見つけました',
    },
  ],
};

const BLOG_STATS = {
  total: 1,
  items: [
    {
      slug: 'arianotify',
      published: true,
      createdAt: '2026-09-28T00:00:00.000Z',
      views: 1234,
      feedbackCount: 5,
      tags: ['a11y'],
    },
  ],
};

const fetchMock = vi.fn<typeof fetch>();

const requestedUrl = (): unknown => fetchMock.mock.calls[0]?.[0];

const requestedInit = (): RequestInit | undefined =>
  fetchMock.mock.calls[0]?.[1];

const requestedAuthorization = (): string | null =>
  new Headers(requestedInit()?.headers).get('Authorization');

beforeEach(() => {
  vi.stubEnv('OWNER_API_TOKEN', TOKEN);
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockReset();
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('fetchOwnerBlogs', () => {
  describe('正常系', () => {
    it('本番の api の記事一覧を、トークンを Bearer で添えて読む', async () => {
      fetchMock.mockResolvedValue(Response.json({ items: [BLOG] }));

      await expect(fetchOwnerBlogs(undefined)).resolves.toStrictEqual([BLOG]);
      expect(requestedUrl()).toBe('https://api.k8o.me/owner/blogs');
      expect(requestedAuthorization()).toBe(`Bearer ${TOKEN}`);
    });

    it('渡した中断のシグナルで fetch を中断できるようにする', async () => {
      fetchMock.mockResolvedValue(Response.json({ items: [] }));
      const controller = new AbortController();

      await fetchOwnerBlogs(controller.signal);

      expect(requestedInit()?.signal).toBe(controller.signal);
    });
  });

  describe('異常系', () => {
    it.each([401, 500])(
      '%i が返ったら、ログに残して例外を投げる',
      async (status) => {
        fetchMock.mockResolvedValue(Response.json({ ok: false }, { status }));

        await expect(fetchOwnerBlogs(undefined)).rejects.toThrow(
          `オーナー API の /owner/blogs が ${status} を返しました`,
        );
        expect(console.error).toHaveBeenCalledOnce();
      },
    );

    it('トークンが未設定なら、api を呼ばずに例外を投げる', async () => {
      vi.stubEnv('OWNER_API_TOKEN', undefined);

      await expect(fetchOwnerBlogs(undefined)).rejects.toThrow(
        'OWNER_API_TOKEN が設定されていません',
      );
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it.each([
      ['末尾の改行', 'owner-secret\n'],
      ['途中の CRLF', 'owner\r\nsecret'],
      ['空白', 'owner secret'],
    ])(
      'トークンに%sが入っていたら、api を呼ばず、値を入れない文で例外を投げる',
      async (_, token) => {
        vi.stubEnv('OWNER_API_TOKEN', token);

        const error = await fetchOwnerBlogs(undefined).catch(
          (thrown: unknown) => thrown,
        );

        expect(error).toStrictEqual(
          new Error(
            'OWNER_API_TOKEN に Bearer のトークンに使えない文字（改行など）が入っています',
          ),
        );
        expect(fetchMock).not.toHaveBeenCalled();
      },
    );
  });

  describe('エッジケース', () => {
    it('トークンが空なら、空の Bearer を送らずに例外を投げる', async () => {
      vi.stubEnv('OWNER_API_TOKEN', '');

      await expect(fetchOwnerBlogs(undefined)).rejects.toThrow(
        'OWNER_API_TOKEN が設定されていません',
      );
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it.each([
      ['base64', 'ab+/Cd9=='],
      ['base64url', 'ab-_Cd9'],
      ['16進', '0123abcdef'],
    ])('%s で作ったトークンは、そのまま Bearer で送る', async (_, token) => {
      vi.stubEnv('OWNER_API_TOKEN', token);
      fetchMock.mockResolvedValue(Response.json({ items: [] }));

      await fetchOwnerBlogs(undefined);

      expect(requestedAuthorization()).toBe(`Bearer ${token}`);
    });

    it('呼ぶたびにその時点のトークンを読む', async () => {
      fetchMock
        .mockResolvedValueOnce(Response.json({ items: [] }))
        .mockResolvedValueOnce(Response.json({ items: [] }));
      await fetchOwnerBlogs(undefined);
      vi.stubEnv('OWNER_API_TOKEN', 'rotated');

      await fetchOwnerBlogs(undefined);

      expect(
        new Headers(fetchMock.mock.calls[1]?.[1]?.headers).get('Authorization'),
      ).toBe('Bearer rotated');
    });
  });
});

describe('fetchOwnerBlogMarkdown', () => {
  describe('正常系', () => {
    it('本番の api から記事の markdown を、トークンを Bearer で添えて読む', async () => {
      fetchMock.mockResolvedValue(
        Response.json({ slug: 'arianotify', markdown: '# ariaNotify()' }),
      );

      await expect(
        fetchOwnerBlogMarkdown('arianotify', undefined),
      ).resolves.toBe('# ariaNotify()');
      expect(requestedUrl()).toBe('https://api.k8o.me/owner/blogs/arianotify');
      expect(requestedAuthorization()).toBe(`Bearer ${TOKEN}`);
    });

    it('渡した中断のシグナルで fetch を中断できるようにする', async () => {
      fetchMock.mockResolvedValue(
        Response.json({ slug: 'arianotify', markdown: '# ariaNotify()' }),
      );
      const controller = new AbortController();

      await fetchOwnerBlogMarkdown('arianotify', controller.signal);

      expect(requestedInit()?.signal).toBe(controller.signal);
    });
  });

  describe('異常系', () => {
    it.each([401, 500])(
      '%i が返ったら、ログに残して例外を投げる',
      async (status) => {
        fetchMock.mockResolvedValue(Response.json({ ok: false }, { status }));

        await expect(
          fetchOwnerBlogMarkdown('arianotify', undefined),
        ).rejects.toThrow(
          `オーナー API の /owner/blogs/arianotify が ${status} を返しました`,
        );
        expect(console.error).toHaveBeenCalledOnce();
      },
    );

    it('トークンが未設定なら、api を呼ばずに例外を投げる', async () => {
      vi.stubEnv('OWNER_API_TOKEN', undefined);

      await expect(
        fetchOwnerBlogMarkdown('arianotify', undefined),
      ).rejects.toThrow('OWNER_API_TOKEN が設定されていません');
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe('エッジケース', () => {
    it('記事が無い（404）なら null を返す', async () => {
      fetchMock.mockResolvedValue(
        Response.json({ ok: false, error: 'not_found' }, { status: 404 }),
      );

      await expect(
        fetchOwnerBlogMarkdown('missing', undefined),
      ).resolves.toBeNull();
      expect(console.error).not.toHaveBeenCalled();
    });

    it('slug の形が api に断られた（400）なら null を返す', async () => {
      fetchMock.mockResolvedValue(
        Response.json({ ok: false, error: 'invalid_request' }, { status: 400 }),
      );

      await expect(
        fetchOwnerBlogMarkdown('Bad_Slug', undefined),
      ).resolves.toBeNull();
    });
  });
});

describe('fetchOwnerOverview', () => {
  describe('正常系', () => {
    it('本番の api の運営の概要を、トークンを Bearer で添えて読む', async () => {
      fetchMock.mockResolvedValue(Response.json(OVERVIEW));

      await expect(fetchOwnerOverview(undefined)).resolves.toStrictEqual(
        OVERVIEW,
      );
      expect(requestedUrl()).toBe('https://api.k8o.me/owner/overview');
      expect(requestedAuthorization()).toBe(`Bearer ${TOKEN}`);
    });

    it('渡した中断のシグナルで fetch を中断できるようにする', async () => {
      fetchMock.mockResolvedValue(Response.json(OVERVIEW));
      const controller = new AbortController();

      await fetchOwnerOverview(controller.signal);

      expect(requestedInit()?.signal).toBe(controller.signal);
    });
  });

  describe('異常系', () => {
    it.each([401, 500])(
      '%i が返ったら、パスと状態だけの文をログに残して例外を投げる',
      async (status) => {
        fetchMock.mockResolvedValue(Response.json({ ok: false }, { status }));

        await expect(fetchOwnerOverview(undefined)).rejects.toThrow(
          `オーナー API の /owner/overview が ${status} を返しました`,
        );
        expect(console.error).toHaveBeenCalledExactlyOnceWith(
          `オーナー API の /owner/overview が ${status} を返しました`,
        );
      },
    );
  });
});

describe('fetchOwnerInquiries', () => {
  describe('正常系', () => {
    it('ページの番号と件数を query に載せて、本番の api のお問い合わせの一覧を、トークンを Bearer で添えて読む', async () => {
      fetchMock.mockResolvedValue(Response.json(INQUIRY_PAGE));

      await expect(
        fetchOwnerInquiries({ page: 2, pageSize: 20 }, undefined),
      ).resolves.toStrictEqual(INQUIRY_PAGE);
      expect(requestedUrl()).toBe(
        'https://api.k8o.me/owner/inquiries?page=2&pageSize=20',
      );
      expect(requestedAuthorization()).toBe(`Bearer ${TOKEN}`);
    });

    it('渡した中断のシグナルで fetch を中断できるようにする', async () => {
      fetchMock.mockResolvedValue(Response.json(INQUIRY_PAGE));
      const controller = new AbortController();

      await fetchOwnerInquiries({ page: 1, pageSize: 20 }, controller.signal);

      expect(requestedInit()?.signal).toBe(controller.signal);
    });
  });

  describe('異常系', () => {
    it.each([400, 401, 500])(
      '%i が返ったら、query を入れずにパスと状態だけの文をログに残して例外を投げる',
      async (status) => {
        fetchMock.mockResolvedValue(Response.json({ ok: false }, { status }));

        await expect(
          fetchOwnerInquiries({ page: 2, pageSize: 20 }, undefined),
        ).rejects.toThrow(
          new Error(
            `オーナー API の /owner/inquiries が ${status} を返しました`,
          ),
        );
        expect(console.error).toHaveBeenCalledExactlyOnceWith(
          `オーナー API の /owner/inquiries が ${status} を返しました`,
        );
      },
    );
  });
});

describe('fetchOwnerBlogStats', () => {
  describe('正常系', () => {
    it('絞り込み・並び順・ページの番号と件数を query に載せて、本番の api の記事ごとの記録を、トークンを Bearer で添えて読む', async () => {
      fetchMock.mockResolvedValue(Response.json(BLOG_STATS));

      await expect(
        fetchOwnerBlogStats(
          { status: 'draft', sort: 'views', page: 2, pageSize: 50 },
          undefined,
        ),
      ).resolves.toStrictEqual(BLOG_STATS);
      expect(requestedUrl()).toBe(
        'https://api.k8o.me/owner/blog-stats?status=draft&sort=views&page=2&pageSize=50',
      );
      expect(requestedAuthorization()).toBe(`Bearer ${TOKEN}`);
    });

    it('渡した中断のシグナルで fetch を中断できるようにする', async () => {
      fetchMock.mockResolvedValue(Response.json(BLOG_STATS));
      const controller = new AbortController();

      await fetchOwnerBlogStats(
        { status: 'all', sort: 'recent', page: 1, pageSize: 50 },
        controller.signal,
      );

      expect(requestedInit()?.signal).toBe(controller.signal);
    });
  });

  describe('異常系', () => {
    it.each([400, 401, 500])(
      '%i が返ったら、query を入れずにパスと状態だけの文をログに残して例外を投げる',
      async (status) => {
        fetchMock.mockResolvedValue(Response.json({ ok: false }, { status }));

        await expect(
          fetchOwnerBlogStats(
            { status: 'draft', sort: 'views', page: 2, pageSize: 50 },
            undefined,
          ),
        ).rejects.toThrow(
          new Error(
            `オーナー API の /owner/blog-stats が ${status} を返しました`,
          ),
        );
        expect(console.error).toHaveBeenCalledExactlyOnceWith(
          `オーナー API の /owner/blog-stats が ${status} を返しました`,
        );
      },
    );
  });
});
