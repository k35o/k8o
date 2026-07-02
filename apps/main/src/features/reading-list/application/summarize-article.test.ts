import { db } from '@repo/database';

import { summarizeArticle } from '../infrastructure/summarize';
import { generateAndSaveSummary } from './summarize-article';
import { MAX_SUMMARY_ATTEMPTS } from './summary-policy';

vi.mock('@repo/database', () => ({
  db: {
    _schema: {
      articles: {
        id: 'articles.id',
        summary: 'articles.summary',
        summaryAttempts: 'articles.summary_attempts',
      },
    },
    _utils: {
      // 実体は SQL 断片だが、テストでは呼び出し検証用のセンチネルに置き換える
      increment: vi.fn((column: unknown) => ({ __increment: column })),
    },
    query: {
      articles: {
        findFirst: vi.fn(),
      },
    },
    update: vi.fn(),
  },
}));

vi.mock('../infrastructure/summarize', () => ({
  summarizeArticle: vi.fn(),
}));

const mockUpdateChain = (rowsAffected: number) => {
  const whereMock = vi.fn().mockResolvedValue({ rowsAffected });
  const setMock = vi.fn().mockReturnValue({ where: whereMock });
  vi.mocked(db.update).mockReturnValue({ set: setMock } as never);
  return { setMock, whereMock };
};

describe('generateAndSaveSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateChain(1);
  });

  describe('冪等性', () => {
    it('既に summary がある記事は生成せずそのまま返す', async () => {
      vi.mocked(db.query.articles.findFirst).mockResolvedValue({
        id: 1,
        url: 'https://example.com/a',
        summary: '既存の要約',
        summaryAttempts: 0,
      } as never);

      const result = await generateAndSaveSummary(1);

      expect(result).toEqual({ summary: '既存の要約' });
      // 既に要約があるので外部生成も更新も行わない（コスト天井の担保）
      expect(summarizeArticle).not.toHaveBeenCalled();
      expect(db.update).not.toHaveBeenCalled();
    });
  });

  describe('正常系', () => {
    it('summary が無ければ試行回数を予約してから生成して保存する', async () => {
      vi.mocked(db.query.articles.findFirst).mockResolvedValue({
        id: 1,
        url: 'https://example.com/a',
        summary: null,
        summaryAttempts: 0,
      } as never);
      vi.mocked(summarizeArticle).mockResolvedValue('生成した要約');

      const { setMock } = mockUpdateChain(1);

      const result = await generateAndSaveSummary(1);

      expect(summarizeArticle).toHaveBeenCalledWith('https://example.com/a');
      // 1回目の update = 予約（summary_attempts の increment）、2回目 = summary 保存
      expect(setMock).toHaveBeenNthCalledWith(1, {
        summaryAttempts: { __increment: 'articles.summary_attempts' },
      });
      expect(setMock).toHaveBeenNthCalledWith(2, { summary: '生成した要約' });
      expect(result).toEqual({ summary: '生成した要約' });
    });
  });

  describe('並列実行の防止', () => {
    it('予約の変更行数が 0 なら生成せず、保存済みの summary を返す', async () => {
      vi.mocked(db.query.articles.findFirst)
        .mockResolvedValueOnce({
          id: 1,
          url: 'https://example.com/a',
          summary: null,
          summaryAttempts: 0,
        } as never)
        .mockResolvedValueOnce({ summary: '並列で生成された要約' } as never);

      mockUpdateChain(0);

      const result = await generateAndSaveSummary(1);

      expect(summarizeArticle).not.toHaveBeenCalled();
      expect(result).toEqual({ summary: '並列で生成された要約' });
    });

    it('予約の変更行数が 0 で summary も無ければ gaveUp を返す', async () => {
      vi.mocked(db.query.articles.findFirst)
        .mockResolvedValueOnce({
          id: 1,
          url: 'https://example.com/a',
          summary: null,
          summaryAttempts: MAX_SUMMARY_ATTEMPTS - 1,
        } as never)
        .mockResolvedValueOnce({ summary: null } as never);

      mockUpdateChain(0);

      const result = await generateAndSaveSummary(1);

      expect(summarizeArticle).not.toHaveBeenCalled();
      expect(result).toEqual({ summary: null, gaveUp: true });
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

    it('要約生成に失敗しても予約済みの試行回数のままにし、上限未満なら gaveUp は立てない', async () => {
      vi.mocked(db.query.articles.findFirst).mockResolvedValue({
        id: 1,
        url: 'https://example.com/a',
        summary: null,
        summaryAttempts: 0,
      } as never);
      vi.mocked(summarizeArticle).mockResolvedValue(null);

      const { setMock } = mockUpdateChain(1);

      const result = await generateAndSaveSummary(1);

      // 失敗は予約時の increment で記録済み（追加の update はしない）
      expect(db.update).toHaveBeenCalledOnce();
      expect(setMock).toHaveBeenCalledWith({
        summaryAttempts: { __increment: 'articles.summary_attempts' },
      });
      expect(result.error).toBeDefined();
      expect(result.gaveUp).toBe(false);
    });

    it('最後の試行で失敗したら gaveUp を立てる', async () => {
      vi.mocked(db.query.articles.findFirst).mockResolvedValue({
        id: 1,
        url: 'https://example.com/a',
        summary: null,
        summaryAttempts: MAX_SUMMARY_ATTEMPTS - 1,
      } as never);
      vi.mocked(summarizeArticle).mockResolvedValue(null);

      const result = await generateAndSaveSummary(1);

      expect(db.update).toHaveBeenCalledOnce();
      expect(result.gaveUp).toBe(true);
    });
  });

  describe('エッジケース', () => {
    it('既に上限まで試行している記事は予約も生成もせず諦める', async () => {
      vi.mocked(db.query.articles.findFirst).mockResolvedValue({
        id: 1,
        url: 'https://example.com/a',
        summary: null,
        summaryAttempts: MAX_SUMMARY_ATTEMPTS,
      } as never);

      const result = await generateAndSaveSummary(1);

      expect(result).toEqual({ summary: null, gaveUp: true });
      expect(summarizeArticle).not.toHaveBeenCalled();
      expect(db.update).not.toHaveBeenCalled();
    });
  });
});
