import { fetchOgMetadata } from '../infrastructure/og-metadata';
import {
  findEnrichTargets,
  updateArticleOgById,
} from '../infrastructure/reading-list-repository';
import { enrichArticleMetadata } from './enrich-articles';

vi.mock('../infrastructure/og-metadata', () => ({
  fetchOgMetadata: vi.fn(),
}));

vi.mock('../infrastructure/reading-list-repository', () => ({
  findEnrichTargets: vi.fn(),
  updateArticleOgById: vi.fn(),
}));

describe('enrichArticleMetadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('正常系', () => {
    it('OGP 未取得の記事に取得した画像・説明を保存する', async () => {
      vi.mocked(findEnrichTargets).mockResolvedValue([
        { id: 1, url: 'https://example.com/a' },
      ]);
      vi.mocked(fetchOgMetadata).mockResolvedValue({
        title: 'タイトル',
        description: '説明',
        imageUrl: 'https://example.com/og.png',
      });

      const result = await enrichArticleMetadata();

      expect(result.enrichedArticles).toBe(1);
      expect(fetchOgMetadata).toHaveBeenCalledWith('https://example.com/a');
      expect(updateArticleOgById).toHaveBeenCalledWith(1, {
        imageUrl: 'https://example.com/og.png',
        description: '説明',
      });
    });

    it('画像のみ取得できた場合は description を null で保存する', async () => {
      vi.mocked(findEnrichTargets).mockResolvedValue([
        { id: 1, url: 'https://example.com/a' },
      ]);
      vi.mocked(fetchOgMetadata).mockResolvedValue({
        title: undefined,
        description: undefined,
        imageUrl: 'https://example.com/og.png',
      });

      const result = await enrichArticleMetadata();

      expect(result.enrichedArticles).toBe(1);
      expect(updateArticleOgById).toHaveBeenCalledWith(1, {
        imageUrl: 'https://example.com/og.png',
        description: null,
      });
    });
  });

  describe('エッジケース', () => {
    it('対象記事が無ければ何もしない', async () => {
      vi.mocked(findEnrichTargets).mockResolvedValue([]);

      const result = await enrichArticleMetadata();

      expect(result.enrichedArticles).toBe(0);
      expect(fetchOgMetadata).not.toHaveBeenCalled();
      expect(updateArticleOgById).not.toHaveBeenCalled();
    });

    it('OGP を取得できなかった記事は更新せず次回に持ち越す', async () => {
      vi.mocked(findEnrichTargets).mockResolvedValue([
        { id: 1, url: 'https://example.com/a' },
      ]);
      vi.mocked(fetchOgMetadata).mockResolvedValue({
        title: undefined,
        description: undefined,
        imageUrl: undefined,
      });

      const result = await enrichArticleMetadata();

      expect(result.enrichedArticles).toBe(0);
      expect(updateArticleOgById).not.toHaveBeenCalled();
    });
  });
});
