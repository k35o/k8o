import { db } from '@repo/database';
import { gte } from 'drizzle-orm';
import { cacheLife } from 'next/cache';

import { getArticleSources, getArticles } from './reading-list';

vi.mock('@repo/database', () => ({
  db: {
    _schema: {
      articles: {
        publishedAt: 'articles.publishedAt',
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

vi.mock('next/cache', () => ({
  cacheLife: vi.fn(),
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

      expect(cacheLife).toHaveBeenCalledWith('hours');
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

      expect(queryOptions.with).toEqual({ articleSource: true });
      expect(queryOptions.where).toEqual({
        type: 'gte',
        column: 'articles.publishedAt',
        value: '2025-12-27T12:00:00.000Z',
      });
      expect(queryOptions.orderBy).toEqual(expect.any(Function));
      expect(result).toEqual([
        {
          id: 1,
          title: '記事タイトル',
          url: 'https://example.com/articles/1',
          publishedAt: '2026-03-20T00:00:00.000Z',
          source: {
            id: 10,
            title: 'Zenn',
            siteUrl: 'https://zenn.dev',
          },
        },
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

      expect(cacheLife).toHaveBeenCalledWith('hours');
      expect(db.query.articleSources.findMany).toHaveBeenCalledWith({
        orderBy: expect.any(Function) as () => unknown,
      });
      expect(result).toEqual([
        {
          id: 2,
          title: 'Qiita',
        },
      ]);
    });
  });
});
