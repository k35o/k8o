import { db } from '@repo/database';

import { fetchOgMetadata } from '../infrastructure/og-metadata';
import { enrichArticleMetadata } from './enrich-articles';

vi.mock('@repo/database', () => ({
  db: {
    query: {
      articles: {
        findMany: vi.fn(),
      },
    },
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn(),
      }),
    }),
    _schema: {
      articles: {
        id: 'id',
        url: 'url',
        imageUrl: 'image_url',
        description: 'description',
        publishedAt: 'published_at',
      },
    },
  },
}));

vi.mock('../infrastructure/og-metadata', () => ({
  fetchOgMetadata: vi.fn(),
}));

describe('enrichArticleMetadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.update).mockReturnValue({
      set: vi.fn().mockReturnValue({ where: vi.fn() }),
    } as never);
  });

  describe('正常系', () => {
    it('OGP 未取得の記事に取得した画像・説明を保存する', async () => {
      vi.mocked(db.query.articles.findMany).mockResolvedValue([
        { id: 1, url: 'https://example.com/a' } as never,
      ]);
      vi.mocked(fetchOgMetadata).mockResolvedValue({
        title: 'タイトル',
        description: '説明',
        image: 'https://example.com/og.png',
      });

      const setMock = vi.fn().mockReturnValue({ where: vi.fn() });
      vi.mocked(db.update).mockReturnValue({ set: setMock } as never);

      const result = await enrichArticleMetadata();

      expect(result.enrichedArticles).toBe(1);
      expect(fetchOgMetadata).toHaveBeenCalledWith('https://example.com/a');
      expect(setMock).toHaveBeenCalledWith({
        imageUrl: 'https://example.com/og.png',
        description: '説明',
      });
    });

    it('画像のみ取得できた場合は description を null で保存する', async () => {
      vi.mocked(db.query.articles.findMany).mockResolvedValue([
        { id: 1, url: 'https://example.com/a' } as never,
      ]);
      vi.mocked(fetchOgMetadata).mockResolvedValue({
        title: undefined,
        description: undefined,
        image: 'https://example.com/og.png',
      });

      const setMock = vi.fn().mockReturnValue({ where: vi.fn() });
      vi.mocked(db.update).mockReturnValue({ set: setMock } as never);

      const result = await enrichArticleMetadata();

      expect(result.enrichedArticles).toBe(1);
      expect(setMock).toHaveBeenCalledWith({
        imageUrl: 'https://example.com/og.png',
        description: null,
      });
    });
  });

  describe('エッジケース', () => {
    it('対象記事が無ければ何もしない', async () => {
      vi.mocked(db.query.articles.findMany).mockResolvedValue([]);

      const result = await enrichArticleMetadata();

      expect(result.enrichedArticles).toBe(0);
      expect(fetchOgMetadata).not.toHaveBeenCalled();
      expect(db.update).not.toHaveBeenCalled();
    });

    it('OGP を取得できなかった記事は更新せず次回に持ち越す', async () => {
      vi.mocked(db.query.articles.findMany).mockResolvedValue([
        { id: 1, url: 'https://example.com/a' } as never,
      ]);
      vi.mocked(fetchOgMetadata).mockResolvedValue({
        title: undefined,
        description: undefined,
        image: undefined,
      });

      const result = await enrichArticleMetadata();

      expect(result.enrichedArticles).toBe(0);
      expect(db.update).not.toHaveBeenCalled();
    });
  });
});
