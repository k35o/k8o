import { db } from '@repo/database';

import { reserveSummaryAttempt } from './article-repository';

vi.mock('@repo/database', () => ({
  db: {
    update: vi.fn(),
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
  },
}));

vi.mock('drizzle-orm', () => ({
  and: vi.fn((...conditions: unknown[]) => ({ __and: conditions })),
  eq: vi.fn((column: unknown, value: unknown) => ({ __eq: [column, value] })),
  isNull: vi.fn((column: unknown) => ({ __isNull: column })),
  lt: vi.fn((column: unknown, value: unknown) => ({ __lt: [column, value] })),
}));

const mockUpdateChain = (rowsAffected: number) => {
  const whereMock = vi.fn().mockResolvedValue({ rowsAffected });
  const setMock = vi.fn().mockReturnValue({ where: whereMock });
  vi.mocked(db.update).mockReturnValue({ set: setMock } as never);
  return { setMock, whereMock };
};

describe('reserveSummaryAttempt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('正常系', () => {
    it('summary未生成かつ試行上限未満の条件つきで試行回数をincrementする', async () => {
      const { setMock, whereMock } = mockUpdateChain(1);

      const reserved = await reserveSummaryAttempt(1, 3);

      expect(reserved).toBe(true);
      // 並行制御の要: incrementによる予約と、summary未生成・上限未満の条件
      expect(setMock).toHaveBeenCalledWith({
        summaryAttempts: { __increment: 'articles.summary_attempts' },
      });
      expect(whereMock).toHaveBeenCalledWith({
        __and: [
          { __eq: ['articles.id', 1] },
          { __isNull: 'articles.summary' },
          { __lt: ['articles.summary_attempts', 3] },
        ],
      });
    });
  });

  describe('異常系', () => {
    it('変更行数が0（並行リクエストに先を越された/上限到達）ならfalseを返す', async () => {
      mockUpdateChain(0);

      await expect(reserveSummaryAttempt(1, 3)).resolves.toBe(false);
    });
  });
});
