import { db } from '@repo/database';
import Parser from 'rss-parser';

import { fetchOgMetadata } from '../infrastructure/og-metadata';
import { syncArticles } from './sync-articles';

vi.mock('../infrastructure/og-metadata', () => ({
  fetchOgMetadata: vi.fn(),
}));

vi.mock('@repo/database', () => ({
  db: {
    query: {
      articleSources: {
        findMany: vi.fn(),
      },
      articles: {
        findMany: vi.fn(),
      },
    },
    insert: vi.fn().mockReturnValue({
      values: vi.fn(),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn(),
      }),
    }),
    _schema: {
      articleSources: { type: 'type' },
      articles: { url: 'url' },
    },
  },
}));

vi.mock('rss-parser', () => {
  const MockParser = vi.fn() as unknown as {
    prototype: { parseString: ReturnType<typeof vi.fn> };
  };
  MockParser.prototype.parseString = vi.fn();
  return { default: MockParser };
});

const mockParseString = Parser.prototype.parseString as ReturnType<
  typeof vi.fn
>;
const mockFetch = vi.fn() as ReturnType<typeof vi.fn>;
vi.stubGlobal('fetch', mockFetch);

describe('syncArticles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-12T00:00:00Z'));
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve('<xml/>'),
    });
    vi.mocked(fetchOgMetadata).mockResolvedValue({
      title: undefined,
      description: undefined,
      imageUrl: undefined,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('正常系', () => {
    it('新しい記事をDBに追加する', async () => {
      vi.mocked(db.query.articleSources.findMany).mockResolvedValue([
        {
          id: 1,
          title: 'web.dev',
          url: 'https://web.dev/feed.xml',
          siteUrl: 'https://web.dev',
          type: 'feed' as const,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ]);

      mockParseString.mockResolvedValue({
        items: [
          {
            title: '新しい記事',
            link: 'https://web.dev/blog/new-article',
            isoDate: '2026-03-10T00:00:00Z',
          },
        ],
      });

      vi.mocked(db.query.articles.findMany).mockResolvedValue([]);

      const result = await syncArticles();

      expect(result.newArticles).toBe(1);
      expect(result.updatedArticles).toBe(0);
      expect(result.failedSources).toHaveLength(0);
      expect(db.insert).toHaveBeenCalledWith(db._schema.articles);
    });

    it('新規記事に取得した OGP（画像・説明）を保存する', async () => {
      vi.mocked(db.query.articleSources.findMany).mockResolvedValue([
        {
          id: 1,
          title: 'web.dev',
          url: 'https://web.dev/feed.xml',
          siteUrl: 'https://web.dev',
          type: 'feed' as const,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ]);

      mockParseString.mockResolvedValue({
        items: [
          {
            title: '新しい記事',
            link: 'https://web.dev/blog/new-article',
            isoDate: '2026-03-10T00:00:00Z',
          },
        ],
      });

      vi.mocked(db.query.articles.findMany).mockResolvedValue([]);
      vi.mocked(fetchOgMetadata).mockResolvedValue({
        title: 'OGタイトル',
        description: 'OGの説明',
        imageUrl: 'https://web.dev/og.png',
      });

      const valuesMock = vi.fn();
      vi.mocked(db.insert).mockReturnValue({ values: valuesMock } as never);

      await syncArticles();

      expect(fetchOgMetadata).toHaveBeenCalledWith(
        'https://web.dev/blog/new-article',
      );
      expect(valuesMock).toHaveBeenCalledWith([
        expect.objectContaining({
          url: 'https://web.dev/blog/new-article',
          imageUrl: 'https://web.dev/og.png',
          description: 'OGの説明',
        }),
      ]);
    });

    it('OGP が取得できなかった新規記事は imageUrl/description を null で保存する', async () => {
      vi.mocked(db.query.articleSources.findMany).mockResolvedValue([
        {
          id: 1,
          title: 'web.dev',
          url: 'https://web.dev/feed.xml',
          siteUrl: 'https://web.dev',
          type: 'feed' as const,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ]);

      mockParseString.mockResolvedValue({
        items: [
          {
            title: '新しい記事',
            link: 'https://web.dev/blog/new-article',
            isoDate: '2026-03-10T00:00:00Z',
          },
        ],
      });

      vi.mocked(db.query.articles.findMany).mockResolvedValue([]);

      const valuesMock = vi.fn();
      vi.mocked(db.insert).mockReturnValue({ values: valuesMock } as never);

      await syncArticles();

      expect(valuesMock).toHaveBeenCalledWith([
        expect.objectContaining({
          url: 'https://web.dev/blog/new-article',
          imageUrl: null,
          description: null,
        }),
      ]);
    });

    it('ソースがない場合は何も追加しない', async () => {
      vi.mocked(db.query.articleSources.findMany).mockResolvedValue([]);
      vi.mocked(db.query.articles.findMany).mockResolvedValue([]);

      const result = await syncArticles();

      expect(result.newArticles).toBe(0);
      expect(result.updatedArticles).toBe(0);
      expect(result.failedSources).toHaveLength(0);
      expect(db.insert).not.toHaveBeenCalled();
    });

    it('複数ソースから並列に取得する', async () => {
      vi.mocked(db.query.articleSources.findMany).mockResolvedValue([
        {
          id: 1,
          title: 'web.dev',
          url: 'https://web.dev/feed.xml',
          siteUrl: 'https://web.dev',
          type: 'feed' as const,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
        {
          id: 2,
          title: 'Zenn',
          url: 'https://zenn.dev/feed',
          siteUrl: 'https://zenn.dev',
          type: 'feed' as const,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ]);

      mockParseString
        .mockResolvedValueOnce({
          items: [
            {
              title: 'web.dev記事',
              link: 'https://web.dev/blog/article-1',
              isoDate: '2026-03-11T00:00:00Z',
            },
          ],
        })
        .mockResolvedValueOnce({
          items: [
            {
              title: 'Zenn記事',
              link: 'https://zenn.dev/article-1',
              isoDate: '2026-03-10T00:00:00Z',
            },
          ],
        });

      vi.mocked(db.query.articles.findMany).mockResolvedValue([]);

      const result = await syncArticles();

      expect(result.newArticles).toBe(2);
      expect(mockParseString).toHaveBeenCalledTimes(2);
    });

    it('既存記事のtitleが変わっていたら更新する', async () => {
      vi.mocked(db.query.articleSources.findMany).mockResolvedValue([
        {
          id: 1,
          title: 'web.dev',
          url: 'https://web.dev/feed.xml',
          siteUrl: 'https://web.dev',
          type: 'feed' as const,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ]);

      mockParseString.mockResolvedValue({
        items: [
          {
            title: '更新されたタイトル',
            link: 'https://web.dev/blog/existing',
            isoDate: '2026-03-10T00:00:00Z',
          },
        ],
      });

      vi.mocked(db.query.articles.findMany).mockResolvedValue([
        {
          url: 'https://web.dev/blog/existing',
          title: '古いタイトル',
        } as never,
      ]);

      const result = await syncArticles();

      expect(result.newArticles).toBe(0);
      expect(result.updatedArticles).toBe(1);
      expect(db.update).toHaveBeenCalledWith(db._schema.articles);
    });

    it('titleが同じ場合は更新しない', async () => {
      vi.mocked(db.query.articleSources.findMany).mockResolvedValue([
        {
          id: 1,
          title: 'web.dev',
          url: 'https://web.dev/feed.xml',
          siteUrl: 'https://web.dev',
          type: 'feed' as const,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ]);

      mockParseString.mockResolvedValue({
        items: [
          {
            title: '同じタイトル',
            link: 'https://web.dev/blog/existing',
            isoDate: '2026-03-10T00:00:00Z',
          },
        ],
      });

      vi.mocked(db.query.articles.findMany).mockResolvedValue([
        {
          url: 'https://web.dev/blog/existing',
          title: '同じタイトル',
        } as never,
      ]);

      const result = await syncArticles();

      expect(result.newArticles).toBe(0);
      expect(result.updatedArticles).toBe(0);
      expect(db.update).not.toHaveBeenCalled();
    });
  });

  describe('フィルタリング', () => {
    it('3ヶ月より前の記事はスキップする', async () => {
      vi.mocked(db.query.articleSources.findMany).mockResolvedValue([
        {
          id: 1,
          title: 'web.dev',
          url: 'https://web.dev/feed.xml',
          siteUrl: 'https://web.dev',
          type: 'feed' as const,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ]);

      mockParseString.mockResolvedValue({
        items: [
          {
            title: '古い記事',
            link: 'https://web.dev/blog/old',
            isoDate: '2025-11-01T00:00:00Z',
          },
          {
            title: '新しい記事',
            link: 'https://web.dev/blog/new',
            isoDate: '2026-03-10T00:00:00Z',
          },
        ],
      });

      vi.mocked(db.query.articles.findMany).mockResolvedValue([]);

      const result = await syncArticles();

      expect(result.newArticles).toBe(1);
    });

    it('title・link・publishedAtのいずれかが欠けている記事はスキップする', async () => {
      vi.mocked(db.query.articleSources.findMany).mockResolvedValue([
        {
          id: 1,
          title: 'web.dev',
          url: 'https://web.dev/feed.xml',
          siteUrl: 'https://web.dev',
          type: 'feed' as const,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ]);

      mockParseString.mockResolvedValue({
        items: [
          { title: 'タイトルのみ', link: undefined, isoDate: undefined },
          {
            title: undefined,
            link: 'https://web.dev/blog/no-title',
            isoDate: '2026-03-10T00:00:00Z',
          },
          {
            title: '日付なし',
            link: 'https://web.dev/blog/no-date',
            isoDate: undefined,
            pubDate: undefined,
          },
          {
            title: '完全な記事',
            link: 'https://web.dev/blog/complete',
            isoDate: '2026-03-10T00:00:00Z',
          },
        ],
      });

      vi.mocked(db.query.articles.findMany).mockResolvedValue([]);

      const result = await syncArticles();

      expect(result.newArticles).toBe(1);
    });

    it('pubDate がパース不能な記事はスキップする', async () => {
      vi.mocked(db.query.articleSources.findMany).mockResolvedValue([
        {
          id: 1,
          title: 'web.dev',
          url: 'https://web.dev/feed.xml',
          siteUrl: 'https://web.dev',
          type: 'feed' as const,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ]);

      mockParseString.mockResolvedValue({
        items: [
          {
            title: 'パース不能な日付',
            link: 'https://web.dev/blog/bad-date',
            isoDate: undefined,
            pubDate: 'not a parsable date',
          },
          {
            // sanitizeFeedDates が不正な Atom 日付を空文字化した場合の経路
            title: '空文字の日付',
            link: 'https://web.dev/blog/empty-date',
            isoDate: undefined,
            pubDate: '',
          },
          {
            title: '正常な記事',
            link: 'https://web.dev/blog/ok',
            isoDate: '2026-03-10T00:00:00Z',
          },
        ],
      });

      vi.mocked(db.query.articles.findMany).mockResolvedValue([]);

      const valuesMock = vi.fn();
      vi.mocked(db.insert).mockReturnValue({ values: valuesMock } as never);

      const result = await syncArticles();

      expect(result.newArticles).toBe(1);
      expect(valuesMock).toHaveBeenCalledWith([
        expect.objectContaining({ url: 'https://web.dev/blog/ok' }),
      ]);
    });

    it('非 ISO 形式の pubDate は ISO 8601 に正規化して保存する', async () => {
      vi.mocked(db.query.articleSources.findMany).mockResolvedValue([
        {
          id: 1,
          title: 'web.dev',
          url: 'https://web.dev/feed.xml',
          siteUrl: 'https://web.dev',
          type: 'feed' as const,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ]);

      mockParseString.mockResolvedValue({
        items: [
          {
            title: 'RFC 2822 日付の記事',
            link: 'https://web.dev/blog/rfc2822',
            isoDate: undefined,
            pubDate: 'Tue, 10 Mar 2026 09:30:00 GMT',
          },
        ],
      });

      vi.mocked(db.query.articles.findMany).mockResolvedValue([]);

      const valuesMock = vi.fn();
      vi.mocked(db.insert).mockReturnValue({ values: valuesMock } as never);

      const result = await syncArticles();

      expect(result.newArticles).toBe(1);
      expect(valuesMock).toHaveBeenCalledWith([
        expect.objectContaining({
          url: 'https://web.dev/blog/rfc2822',
          publishedAt: '2026-03-10T09:30:00.000Z',
        }),
      ]);
    });

    it('https 以外のスキームの link はスキップして保存しない', async () => {
      vi.mocked(db.query.articleSources.findMany).mockResolvedValue([
        {
          id: 1,
          title: 'web.dev',
          url: 'https://web.dev/feed.xml',
          siteUrl: 'https://web.dev',
          type: 'feed' as const,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ]);

      mockParseString.mockResolvedValue({
        items: [
          {
            title: 'XSS を狙う記事',
            link: 'javascript:alert(1)',
            isoDate: '2026-03-10T00:00:00Z',
          },
          {
            title: 'http の記事',
            link: 'http://web.dev/blog/http-only',
            isoDate: '2026-03-10T00:00:00Z',
          },
          {
            title: '正常な記事',
            link: 'https://web.dev/blog/safe',
            isoDate: '2026-03-10T00:00:00Z',
          },
        ],
      });

      vi.mocked(db.query.articles.findMany).mockResolvedValue([]);

      const valuesMock = vi.fn();
      vi.mocked(db.insert).mockReturnValue({ values: valuesMock } as never);

      const result = await syncArticles();

      expect(result.newArticles).toBe(1);
      expect(valuesMock).toHaveBeenCalledWith([
        expect.objectContaining({ url: 'https://web.dev/blog/safe' }),
      ]);
    });

    it('既にDBに存在するURLの記事は追加しない', async () => {
      vi.mocked(db.query.articleSources.findMany).mockResolvedValue([
        {
          id: 1,
          title: 'web.dev',
          url: 'https://web.dev/feed.xml',
          siteUrl: 'https://web.dev',
          type: 'feed' as const,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ]);

      mockParseString.mockResolvedValue({
        items: [
          {
            title: '既存の記事',
            link: 'https://web.dev/blog/existing',
            isoDate: '2026-03-10T00:00:00Z',
          },
          {
            title: '新規の記事',
            link: 'https://web.dev/blog/new',
            isoDate: '2026-03-11T00:00:00Z',
          },
        ],
      });

      vi.mocked(db.query.articles.findMany).mockResolvedValue([
        { url: 'https://web.dev/blog/existing', title: '既存の記事' } as never,
      ]);

      const result = await syncArticles();

      expect(result.newArticles).toBe(1);
    });
  });

  describe('異常系', () => {
    it('フィード取得に失敗したソースを報告する', async () => {
      vi.mocked(db.query.articleSources.findMany).mockResolvedValue([
        {
          id: 1,
          title: 'web.dev',
          url: 'https://web.dev/feed.xml',
          siteUrl: 'https://web.dev',
          type: 'feed' as const,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ]);

      mockFetch.mockRejectedValue(new Error('Network error'));
      vi.mocked(db.query.articles.findMany).mockResolvedValue([]);

      const result = await syncArticles();

      expect(result.newArticles).toBe(0);
      expect(result.failedSources).toEqual(['web.dev']);
    });

    it('一部のソースが失敗しても他のソースは処理を続ける', async () => {
      vi.mocked(db.query.articleSources.findMany).mockResolvedValue([
        {
          id: 1,
          title: '失敗するソース',
          url: 'https://fail.example.com/feed',
          siteUrl: 'https://fail.example.com',
          type: 'feed' as const,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
        {
          id: 2,
          title: '成功するソース',
          url: 'https://success.example.com/feed',
          siteUrl: 'https://success.example.com',
          type: 'feed' as const,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ]);

      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      mockParseString.mockResolvedValueOnce({
        items: [
          {
            title: '成功した記事',
            link: 'https://success.example.com/article',
            isoDate: '2026-03-10T00:00:00Z',
          },
        ],
      });

      vi.mocked(db.query.articles.findMany).mockResolvedValue([]);

      const result = await syncArticles();

      expect(result.newArticles).toBe(1);
      expect(result.failedSources).toEqual(['失敗するソース']);
      expect(mockParseString).toHaveBeenCalledTimes(1);
    });
  });
});
