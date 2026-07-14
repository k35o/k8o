import { db } from '@repo/database';
import { gte } from 'drizzle-orm';

import { getArticleSources, getArticles } from './reading-list';
import { MAX_SUMMARY_ATTEMPTS } from './summary-policy';

vi.mock('@repo/database', () => ({
  db: {
    _schema: {
      articles: {
        publishedAt: 'articles.publishedAt',
        summaryAttempts: 'articles.summary_attempts',
      },
    },
    query: {
      articles: {
        findMany: vi.fn(),
      },
      articleSources: {
        findMany: vi.fn(),
      },
    },
  },
}));

vi.mock('drizzle-orm', () => ({
  desc: vi.fn((value: unknown) => ({ type: 'desc', value })),
  gte: vi.fn((column: unknown, value: unknown) => ({
    type: 'gte',
    column,
    value,
  })),
}));

describe('reading-list service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-27T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getArticles', () => {
    it('直近90日以内の記事を整形して返す', async () => {
      vi.mocked(db.query.articles.findMany).mockResolvedValue([
        {
          id: 1,
          title: '記事タイトル',
          url: 'https://example.com/articles/1',
          publishedAt: '2026-03-20T00:00:00.000Z',
          articleSourceId: 10,
          summaryAttempts: 0,
          createdAt: '2026-03-20T00:00:00.000Z',
          updatedAt: '2026-03-20T00:00:00.000Z',
          articleSource: {
            id: 10,
            title: 'Zenn',
            siteUrl: 'https://zenn.dev',
          },
        },
      ] as unknown as Awaited<ReturnType<typeof db.query.articles.findMany>>);

      const result = await getArticles();

      expect(gte).toHaveBeenCalledWith(
        'articles.publishedAt',
        '2025-12-27T12:00:00.000Z',
      );
      expect(db.query.articles.findMany).toHaveBeenCalledOnce();

      const queryOptions = vi.mocked(db.query.articles.findMany).mock
        .calls[0]?.[0] as unknown as {
        orderBy?: (...args: unknown[]) => unknown[];
        where?: unknown;
        with?: { articleSource: true };
      };

      expect(queryOptions.with).toStrictEqual({ articleSource: true });
      expect(queryOptions.where).toStrictEqual({
        type: 'gte',
        column: 'articles.publishedAt',
        value: '2025-12-27T12:00:00.000Z',
      });
      expect(queryOptions.orderBy).toStrictEqual(expect.any(Function));
      expect(result).toStrictEqual([
        {
          id: 1,
          title: '記事タイトル',
          url: 'https://example.com/articles/1',
          publishedAt: '2026-03-20T00:00:00.000Z',
          description: undefined,
          imageUrl: undefined,
          summary: undefined,
          summaryGaveUp: false,
          source: {
            id: 10,
            title: 'Zenn',
            siteUrl: 'https://zenn.dev',
          },
        },
      ]);
    });

    it('summary が無いまま試行上限に達した記事だけを gaveUp にする', async () => {
      const baseArticle = {
        title: '記事タイトル',
        url: 'https://example.com/articles/1',
        publishedAt: '2026-03-20T00:00:00.000Z',
        articleSourceId: 10,
        createdAt: '2026-03-20T00:00:00.000Z',
        updatedAt: '2026-03-20T00:00:00.000Z',
        articleSource: {
          id: 10,
          title: 'Zenn',
          siteUrl: 'https://zenn.dev',
        },
      };
      vi.mocked(db.query.articles.findMany).mockResolvedValue([
        {
          ...baseArticle,
          id: 1,
          summary: null,
          summaryAttempts: MAX_SUMMARY_ATTEMPTS,
        },
        // 予約 increment のため成功した記事でも上限に達しうるが、gaveUp にはしない
        {
          ...baseArticle,
          id: 2,
          summary: '生成済みの要約',
          summaryAttempts: MAX_SUMMARY_ATTEMPTS,
        },
        {
          ...baseArticle,
          id: 3,
          summary: null,
          summaryAttempts: MAX_SUMMARY_ATTEMPTS - 1,
        },
      ] as unknown as Awaited<ReturnType<typeof db.query.articles.findMany>>);

      const result = await getArticles();

      expect(result.map((a) => a.summaryGaveUp)).toStrictEqual([
        true,
        false,
        false,
      ]);
    });
  });

  describe('getArticleSources', () => {
    it('記事ソース一覧をタイトル順で整形して返す', async () => {
      vi.mocked(db.query.articleSources.findMany).mockResolvedValue([
        {
          id: 2,
          title: 'Qiita',
          siteUrl: 'https://qiita.com',
          url: 'https://qiita.com/feed',
          type: 'feed',
          createdAt: '2026-03-20T00:00:00.000Z',
          updatedAt: '2026-03-20T00:00:00.000Z',
        },
      ] as unknown as Awaited<
        ReturnType<typeof db.query.articleSources.findMany>
      >);

      const result = await getArticleSources();

      expect(db.query.articleSources.findMany).toHaveBeenCalledWith({
        orderBy: expect.any(Function) as () => unknown,
      });
      expect(result).toStrictEqual([
        {
          id: 2,
          title: 'Qiita',
        },
      ]);
    });
  });
});
