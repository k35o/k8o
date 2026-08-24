import { fetchFeedItems } from '../infrastructure/feed-source';
import { fetchOgMetadata } from '../infrastructure/og-metadata';
import {
  findArticleTitles,
  findFeedSources,
  insertArticlesIgnoringDuplicates,
  updateArticleTitles,
} from '../infrastructure/reading-list-repository';
import { syncArticles } from './sync-articles';

vi.mock('../infrastructure/feed-source', () => ({
  fetchFeedItems: vi.fn(),
}));

vi.mock('../infrastructure/og-metadata', () => ({
  fetchOgMetadata: vi.fn(),
}));

vi.mock('../infrastructure/reading-list-repository', () => ({
  findFeedSources: vi.fn(),
  findArticleTitles: vi.fn(),
  insertArticlesIgnoringDuplicates: vi.fn(),
  updateArticleTitles: vi.fn(),
}));

const source = (
  overrides: Partial<{ id: number; title: string; url: string }> = {},
) =>
  ({
    id: 1,
    title: 'web.dev',
    url: 'https://web.dev/feed.xml',
    siteUrl: 'https://web.dev',
    type: 'feed' as const,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }) as never;

describe('syncArticles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-12T00:00:00Z'));
    vi.mocked(findArticleTitles).mockResolvedValue([]);
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
      vi.mocked(findFeedSources).mockResolvedValue([source()]);
      vi.mocked(fetchFeedItems).mockResolvedValue([
        {
          title: '新しい記事',
          link: 'https://web.dev/blog/new-article',
          publishedAt: '2026-03-10T00:00:00Z',
        },
      ]);

      const result = await syncArticles();

      expect(result.newArticles).toBe(1);
      expect(result.updatedArticles).toBe(0);
      expect(result.failedSources).toHaveLength(0);
      expect(insertArticlesIgnoringDuplicates).toHaveBeenCalledOnce();
    });

    it('新規記事に取得した OGP（画像・説明）を保存する', async () => {
      vi.mocked(findFeedSources).mockResolvedValue([source()]);
      vi.mocked(fetchFeedItems).mockResolvedValue([
        {
          title: '新しい記事',
          link: 'https://web.dev/blog/new-article',
          publishedAt: '2026-03-10T00:00:00Z',
        },
      ]);
      vi.mocked(fetchOgMetadata).mockResolvedValue({
        title: 'OGタイトル',
        description: 'OGの説明',
        imageUrl: 'https://web.dev/og.png',
      });

      await syncArticles();

      expect(fetchOgMetadata).toHaveBeenCalledWith(
        'https://web.dev/blog/new-article',
      );
      expect(insertArticlesIgnoringDuplicates).toHaveBeenCalledWith([
        expect.objectContaining({
          url: 'https://web.dev/blog/new-article',
          imageUrl: 'https://web.dev/og.png',
          description: 'OGの説明',
        }),
      ]);
    });

    it('OGP が取得できなかった新規記事は imageUrl/description を null で保存する', async () => {
      vi.mocked(findFeedSources).mockResolvedValue([source()]);
      vi.mocked(fetchFeedItems).mockResolvedValue([
        {
          title: '新しい記事',
          link: 'https://web.dev/blog/new-article',
          publishedAt: '2026-03-10T00:00:00Z',
        },
      ]);

      await syncArticles();

      expect(insertArticlesIgnoringDuplicates).toHaveBeenCalledWith([
        expect.objectContaining({
          url: 'https://web.dev/blog/new-article',
          imageUrl: null,
          description: null,
        }),
      ]);
    });

    it('ソースがない場合は何も追加しない', async () => {
      vi.mocked(findFeedSources).mockResolvedValue([]);

      const result = await syncArticles();

      expect(result.newArticles).toBe(0);
      expect(result.updatedArticles).toBe(0);
      expect(result.failedSources).toHaveLength(0);
      expect(insertArticlesIgnoringDuplicates).not.toHaveBeenCalled();
    });

    it('複数ソースから並列に取得する', async () => {
      vi.mocked(findFeedSources).mockResolvedValue([
        source(),
        source({ id: 2, title: 'Zenn', url: 'https://zenn.dev/feed' }),
      ]);
      vi.mocked(fetchFeedItems)
        .mockResolvedValueOnce([
          {
            title: 'web.dev記事',
            link: 'https://web.dev/blog/article-1',
            publishedAt: '2026-03-11T00:00:00Z',
          },
        ])
        .mockResolvedValueOnce([
          {
            title: 'Zenn記事',
            link: 'https://zenn.dev/article-1',
            publishedAt: '2026-03-10T00:00:00Z',
          },
        ]);

      const result = await syncArticles();

      expect(result.newArticles).toBe(2);
      expect(fetchFeedItems).toHaveBeenCalledTimes(2);
    });

    it('既存記事のtitleが変わっていたら更新する', async () => {
      vi.mocked(findFeedSources).mockResolvedValue([source()]);
      vi.mocked(fetchFeedItems).mockResolvedValue([
        {
          title: '更新されたタイトル',
          link: 'https://web.dev/blog/existing',
          publishedAt: '2026-03-10T00:00:00Z',
        },
      ]);
      vi.mocked(findArticleTitles).mockResolvedValue([
        { url: 'https://web.dev/blog/existing', title: '古いタイトル' },
      ]);

      const result = await syncArticles();

      expect(result.newArticles).toBe(0);
      expect(result.updatedArticles).toBe(1);
      expect(updateArticleTitles).toHaveBeenCalledWith([
        { url: 'https://web.dev/blog/existing', title: '更新されたタイトル' },
      ]);
    });

    it('titleが同じ場合は更新しない', async () => {
      vi.mocked(findFeedSources).mockResolvedValue([source()]);
      vi.mocked(fetchFeedItems).mockResolvedValue([
        {
          title: '同じタイトル',
          link: 'https://web.dev/blog/existing',
          publishedAt: '2026-03-10T00:00:00Z',
        },
      ]);
      vi.mocked(findArticleTitles).mockResolvedValue([
        { url: 'https://web.dev/blog/existing', title: '同じタイトル' },
      ]);

      const result = await syncArticles();

      expect(result.newArticles).toBe(0);
      expect(result.updatedArticles).toBe(0);
      expect(updateArticleTitles).not.toHaveBeenCalled();
    });
  });

  describe('フィルタリング', () => {
    it('3ヶ月より前の記事はスキップする', async () => {
      vi.mocked(findFeedSources).mockResolvedValue([source()]);
      vi.mocked(fetchFeedItems).mockResolvedValue([
        {
          title: '古い記事',
          link: 'https://web.dev/blog/old',
          publishedAt: '2025-11-01T00:00:00Z',
        },
        {
          title: '新しい記事',
          link: 'https://web.dev/blog/new',
          publishedAt: '2026-03-10T00:00:00Z',
        },
      ]);

      const result = await syncArticles();

      expect(result.newArticles).toBe(1);
    });

    it('title・link・publishedAtのいずれかが欠けている記事はスキップする', async () => {
      vi.mocked(findFeedSources).mockResolvedValue([source()]);
      vi.mocked(fetchFeedItems).mockResolvedValue([
        { title: 'タイトルのみ', link: undefined, publishedAt: undefined },
        {
          title: undefined,
          link: 'https://web.dev/blog/no-title',
          publishedAt: '2026-03-10T00:00:00Z',
        },
        {
          title: '日付なし',
          link: 'https://web.dev/blog/no-date',
          publishedAt: undefined,
        },
        {
          title: '完全な記事',
          link: 'https://web.dev/blog/complete',
          publishedAt: '2026-03-10T00:00:00Z',
        },
      ]);

      const result = await syncArticles();

      expect(result.newArticles).toBe(1);
    });

    it('publishedAt がパース不能な記事はスキップする', async () => {
      vi.mocked(findFeedSources).mockResolvedValue([source()]);
      vi.mocked(fetchFeedItems).mockResolvedValue([
        {
          title: 'パース不能な日付',
          link: 'https://web.dev/blog/bad-date',
          publishedAt: 'not a parsable date',
        },
        {
          // sanitizeFeedDates が不正な Atom 日付を空文字化した場合の経路
          title: '空文字の日付',
          link: 'https://web.dev/blog/empty-date',
          publishedAt: '',
        },
        {
          title: '正常な記事',
          link: 'https://web.dev/blog/ok',
          publishedAt: '2026-03-10T00:00:00Z',
        },
      ]);

      const result = await syncArticles();

      expect(result.newArticles).toBe(1);
      expect(insertArticlesIgnoringDuplicates).toHaveBeenCalledWith([
        expect.objectContaining({ url: 'https://web.dev/blog/ok' }),
      ]);
    });

    it('非 ISO 形式の publishedAt は ISO 8601 に正規化して保存する', async () => {
      vi.mocked(findFeedSources).mockResolvedValue([source()]);
      vi.mocked(fetchFeedItems).mockResolvedValue([
        {
          title: 'RFC 2822 日付の記事',
          link: 'https://web.dev/blog/rfc2822',
          publishedAt: 'Tue, 10 Mar 2026 09:30:00 GMT',
        },
      ]);

      const result = await syncArticles();

      expect(result.newArticles).toBe(1);
      expect(insertArticlesIgnoringDuplicates).toHaveBeenCalledWith([
        expect.objectContaining({
          url: 'https://web.dev/blog/rfc2822',
          publishedAt: '2026-03-10T09:30:00.000Z',
        }),
      ]);
    });

    it('https 以外のスキームの link はスキップして保存しない', async () => {
      vi.mocked(findFeedSources).mockResolvedValue([source()]);
      vi.mocked(fetchFeedItems).mockResolvedValue([
        {
          title: 'XSS を狙う記事',
          link: 'javascript:alert(1)',
          publishedAt: '2026-03-10T00:00:00Z',
        },
        {
          title: 'http の記事',
          link: 'http://web.dev/blog/http-only',
          publishedAt: '2026-03-10T00:00:00Z',
        },
        {
          title: '正常な記事',
          link: 'https://web.dev/blog/safe',
          publishedAt: '2026-03-10T00:00:00Z',
        },
      ]);

      const result = await syncArticles();

      expect(result.newArticles).toBe(1);
      expect(insertArticlesIgnoringDuplicates).toHaveBeenCalledWith([
        expect.objectContaining({ url: 'https://web.dev/blog/safe' }),
      ]);
    });

    it('同一同期内で重複する URL は1件だけ追加する', async () => {
      vi.mocked(findFeedSources).mockResolvedValue([source()]);
      vi.mocked(fetchFeedItems).mockResolvedValue([
        {
          title: '記事',
          link: 'https://web.dev/blog/dup',
          publishedAt: '2026-03-10T00:00:00Z',
        },
        {
          title: '記事（重複配信）',
          link: 'https://web.dev/blog/dup',
          publishedAt: '2026-03-11T00:00:00Z',
        },
      ]);

      const result = await syncArticles();

      expect(result.newArticles).toBe(1);
      expect(insertArticlesIgnoringDuplicates).toHaveBeenCalledWith([
        expect.objectContaining({ url: 'https://web.dev/blog/dup' }),
      ]);
    });

    it('既にDBに存在するURLの記事は追加しない', async () => {
      vi.mocked(findFeedSources).mockResolvedValue([source()]);
      vi.mocked(fetchFeedItems).mockResolvedValue([
        {
          title: '既存の記事',
          link: 'https://web.dev/blog/existing',
          publishedAt: '2026-03-10T00:00:00Z',
        },
        {
          title: '新規の記事',
          link: 'https://web.dev/blog/new',
          publishedAt: '2026-03-11T00:00:00Z',
        },
      ]);
      vi.mocked(findArticleTitles).mockResolvedValue([
        { url: 'https://web.dev/blog/existing', title: '既存の記事' },
      ]);

      const result = await syncArticles();

      expect(result.newArticles).toBe(1);
    });
  });

  describe('異常系', () => {
    it('フィード取得に失敗したソースを報告する', async () => {
      vi.mocked(findFeedSources).mockResolvedValue([source()]);
      vi.mocked(fetchFeedItems).mockRejectedValue(new Error('Network error'));

      const result = await syncArticles();

      expect(result.newArticles).toBe(0);
      expect(result.failedSources).toStrictEqual(['web.dev']);
    });

    it('一部のソースが失敗しても他のソースは処理を続ける', async () => {
      vi.mocked(findFeedSources).mockResolvedValue([
        source({
          title: '失敗するソース',
          url: 'https://fail.example.com/feed',
        }),
        source({
          id: 2,
          title: '成功するソース',
          url: 'https://success.example.com/feed',
        }),
      ]);
      vi.mocked(fetchFeedItems)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce([
          {
            title: '成功した記事',
            link: 'https://success.example.com/article',
            publishedAt: '2026-03-10T00:00:00Z',
          },
        ]);

      const result = await syncArticles();

      expect(result.newArticles).toBe(1);
      expect(result.failedSources).toStrictEqual(['失敗するソース']);
    });
  });
});
