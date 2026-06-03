import { db } from '@repo/database';

import { summarizeArticle } from '../infrastructure/summarize';
import { generateAndSaveSummary } from './summarize-article';

vi.mock('@repo/database', () => ({
  db: {
    _schema: {
      articles: { id: 'articles.id' },
    },
    query: {
      articles: {
        findFirst: vi.fn(),
      },
    },
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({ where: vi.fn() }),
    }),
  },
}));

vi.mock('../infrastructure/summarize', () => ({
  summarizeArticle: vi.fn(),
}));

describe('generateAndSaveSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.update).mockReturnValue({
      set: vi.fn().mockReturnValue({ where: vi.fn() }),
    } as never);
  });

  describe('冪等性', () => {
    it('既に summary がある記事は生成せずそのまま返す', async () => {
      vi.mocked(db.query.articles.findFirst).mockResolvedValue({
        id: 1,
        url: 'https://example.com/a',
        summary: '既存の要約',
      } as never);

      const result = await generateAndSaveSummary(1);

      expect(result).toEqual({ summary: '既存の要約' });
      // 既に要約があるので外部生成も更新も行わない（コスト天井の担保）
      expect(summarizeArticle).not.toHaveBeenCalled();
      expect(db.update).not.toHaveBeenCalled();
    });
  });

  describe('正常系', () => {
    it('summary が無ければ生成して保存する', async () => {
      vi.mocked(db.query.articles.findFirst).mockResolvedValue({
        id: 1,
        url: 'https://example.com/a',
        summary: null,
      } as never);
      vi.mocked(summarizeArticle).mockResolvedValue('生成した要約');

      const setMock = vi.fn().mockReturnValue({ where: vi.fn() });
      vi.mocked(db.update).mockReturnValue({ set: setMock } as never);

      const result = await generateAndSaveSummary(1);

      expect(summarizeArticle).toHaveBeenCalledWith('https://example.com/a');
      expect(setMock).toHaveBeenCalledWith({ summary: '生成した要約' });
      expect(result).toEqual({ summary: '生成した要約' });
    });
  });

  describe('異常系', () => {
    it('記事が見つからなければエラーを返し、生成・更新しない', async () => {
      vi.mocked(db.query.articles.findFirst).mockResolvedValue(
        undefined as never,
      );

      const result = await generateAndSaveSummary(999);

      expect(result.error).toBeDefined();
      expect(summarizeArticle).not.toHaveBeenCalled();
      expect(db.update).not.toHaveBeenCalled();
    });

    it('要約生成に失敗したら保存せずエラーを返す（次回再試行できる）', async () => {
      vi.mocked(db.query.articles.findFirst).mockResolvedValue({
        id: 1,
        url: 'https://example.com/a',
        summary: null,
      } as never);
      vi.mocked(summarizeArticle).mockResolvedValue(null);

      const result = await generateAndSaveSummary(1);

      expect(result.error).toBeDefined();
      expect(db.update).not.toHaveBeenCalled();
    });
  });
});
