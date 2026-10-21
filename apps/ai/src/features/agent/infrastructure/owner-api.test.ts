import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchOwnerBlogMarkdown, fetchOwnerBlogs } from './owner-api';

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
