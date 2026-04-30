import { db } from '@repo/database';
import Parser from 'rss-parser';
import { syncArticles } from './sync-articles';

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
  const MockParser = vi.fn();
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
      text: () => Promise.resolve('<xml/>'),
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
