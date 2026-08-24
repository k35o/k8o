import {
  findArticleForSummary,
  findArticleSummary,
  reserveSummaryAttempt,
  saveArticleSummary,
} from '../infrastructure/article-repository';
import { summarizeArticle } from '../infrastructure/summarize';
import { generateAndSaveSummary } from './summarize-article';
import { MAX_SUMMARY_ATTEMPTS } from './summary-policy';

vi.mock('../infrastructure/article-repository', () => ({
  findArticleForSummary: vi.fn(),
  findArticleSummary: vi.fn(),
  reserveSummaryAttempt: vi.fn(),
  saveArticleSummary: vi.fn(),
}));

vi.mock('../infrastructure/summarize', () => ({
  summarizeArticle: vi.fn(),
}));

const article = (
  overrides: Partial<{
    summary: string | null;
    summaryAttempts: number;
  }> = {},
) => ({
  id: 1,
  url: 'https://example.com/a',
  summary: null,
  summaryAttempts: 0,
  ...overrides,
});

describe('generateAndSaveSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(reserveSummaryAttempt).mockResolvedValue(true);
  });

  describe('冪等性', () => {
    it('既に summary がある記事は生成せずそのまま返す', async () => {
      vi.mocked(findArticleForSummary).mockResolvedValue(
        article({ summary: '既存の要約' }),
      );

      const result = await generateAndSaveSummary(1);

      expect(result).toStrictEqual({ summary: '既存の要約' });
      // 既に要約があるので外部生成も予約も行わない（コスト天井の担保）
      expect(summarizeArticle).not.toHaveBeenCalled();
      expect(reserveSummaryAttempt).not.toHaveBeenCalled();
    });
  });

  describe('正常系', () => {
    it('summary が無ければ試行回数を予約してから生成して保存する', async () => {
      vi.mocked(findArticleForSummary).mockResolvedValue(article());
      vi.mocked(summarizeArticle).mockResolvedValue('生成した要約');

      const result = await generateAndSaveSummary(1);

      expect(reserveSummaryAttempt).toHaveBeenCalledWith(
        1,
        MAX_SUMMARY_ATTEMPTS,
      );
      expect(summarizeArticle).toHaveBeenCalledWith('https://example.com/a');
      expect(saveArticleSummary).toHaveBeenCalledWith(1, '生成した要約');
      expect(result).toStrictEqual({ summary: '生成した要約' });
    });
  });

  describe('並列実行の防止', () => {
    it('予約できなければ生成せず、保存済みの summary を返す', async () => {
      vi.mocked(findArticleForSummary).mockResolvedValue(article());
      vi.mocked(reserveSummaryAttempt).mockResolvedValue(false);
      vi.mocked(findArticleSummary).mockResolvedValue('並列で生成された要約');

      const result = await generateAndSaveSummary(1);

      expect(summarizeArticle).not.toHaveBeenCalled();
      expect(result).toStrictEqual({ summary: '並列で生成された要約' });
    });

    it('予約できず summary も無ければ gaveUp を返す', async () => {
      vi.mocked(findArticleForSummary).mockResolvedValue(
        article({ summaryAttempts: MAX_SUMMARY_ATTEMPTS - 1 }),
      );
      vi.mocked(reserveSummaryAttempt).mockResolvedValue(false);
      vi.mocked(findArticleSummary).mockResolvedValue(null);

      const result = await generateAndSaveSummary(1);

      expect(summarizeArticle).not.toHaveBeenCalled();
      expect(result).toStrictEqual({ summary: null, gaveUp: true });
    });
  });

  describe('異常系', () => {
    it('記事が見つからなければエラーを返し、生成・予約しない', async () => {
      vi.mocked(findArticleForSummary).mockResolvedValue(undefined);

      const result = await generateAndSaveSummary(999);

      expect(result.error).toBeDefined();
      expect(summarizeArticle).not.toHaveBeenCalled();
      expect(reserveSummaryAttempt).not.toHaveBeenCalled();
    });

    it('要約生成に失敗しても追加の保存はせず、上限未満なら gaveUp は立てない', async () => {
      vi.mocked(findArticleForSummary).mockResolvedValue(article());
      vi.mocked(summarizeArticle).mockResolvedValue(null);

      const result = await generateAndSaveSummary(1);

      // 失敗は予約時の increment で記録済み（追加の保存はしない）
      expect(saveArticleSummary).not.toHaveBeenCalled();
      expect(result.error).toBeDefined();
      expect(result.gaveUp).toBe(false);
    });

    it('最後の試行で失敗したら gaveUp を立てる', async () => {
      vi.mocked(findArticleForSummary).mockResolvedValue(
        article({ summaryAttempts: MAX_SUMMARY_ATTEMPTS - 1 }),
      );
      vi.mocked(summarizeArticle).mockResolvedValue(null);

      const result = await generateAndSaveSummary(1);

      expect(saveArticleSummary).not.toHaveBeenCalled();
      expect(result.gaveUp).toBe(true);
    });
  });

  describe('エッジケース', () => {
    it('既に上限まで試行している記事は予約も生成もせず諦める', async () => {
      vi.mocked(findArticleForSummary).mockResolvedValue(
        article({ summaryAttempts: MAX_SUMMARY_ATTEMPTS }),
      );

      const result = await generateAndSaveSummary(1);

      expect(result).toStrictEqual({ summary: null, gaveUp: true });
      expect(summarizeArticle).not.toHaveBeenCalled();
      expect(reserveSummaryAttempt).not.toHaveBeenCalled();
    });
  });
});
