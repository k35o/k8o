import { summarizeArticle } from '../infrastructure/article-summarizer';
import {
  countSummaryProgress,
  findSummaryTargets,
  releaseSummaryAttempt,
  reserveSummaryAttempt,
  saveArticleSummary,
} from '../infrastructure/reading-list-repository';
import { getSummaryProgress, summarizeArticles } from './summarize-articles';

vi.mock('../infrastructure/article-summarizer', () => ({
  summarizeArticle: vi.fn(),
}));

vi.mock('../infrastructure/reading-list-repository', () => ({
  countSummaryProgress: vi.fn(),
  findSummaryTargets: vi.fn(),
  reserveSummaryAttempt: vi.fn(),
  releaseSummaryAttempt: vi.fn(),
  saveArticleSummary: vi.fn(),
}));

const NOW = new Date('2026-10-09T00:00:00.000Z');
const LATER = NOW.getTime() + 60_000;

const target = (id: number, summaryAttempts = 0) => ({
  id,
  url: `https://example.com/${id}`,
  title: `記事${id}`,
  summaryAttempts,
});

const summarized = { kind: 'summarized', summary: '要約' } as const;

describe('summarizeArticles', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.mocked(reserveSummaryAttempt).mockResolvedValue(true);
    vi.mocked(releaseSummaryAttempt).mockResolvedValue();
    vi.mocked(saveArticleSummary).mockResolvedValue(true);
    vi.mocked(summarizeArticle).mockResolvedValue(summarized);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('正常系', () => {
    it('直近90日の未要約の記事を、試行の上限と件数を付けて新しい順に選ぶ', async () => {
      vi.mocked(findSummaryTargets).mockResolvedValue([]);

      await summarizeArticles(LATER);

      expect(findSummaryTargets).toHaveBeenCalledWith(
        '2026-07-11T00:00:00.000Z',
        3,
        60,
      );
    });

    it('読んだ試行回数で予約してから要約し、保存する', async () => {
      vi.mocked(findSummaryTargets).mockResolvedValue([target(1, 2)]);

      const result = await summarizeArticles(LATER);

      expect(reserveSummaryAttempt).toHaveBeenCalledWith(1, 2);
      expect(summarizeArticle).toHaveBeenCalledWith(target(1, 2));
      expect(saveArticleSummary).toHaveBeenCalledWith(1, '要約');
      expect(result).toStrictEqual({
        summarizedArticles: 1,
        failedSummaries: 0,
        summaryAborted: false,
      });
    });
  });

  describe('異常系', () => {
    it('記事ごとの失敗は試行を消費したまま次の記事へ進む', async () => {
      vi.mocked(findSummaryTargets).mockResolvedValue([target(1), target(2)]);
      vi.mocked(summarizeArticle).mockResolvedValueOnce({
        kind: 'failed',
        reason: '本文が無い',
      });

      const result = await summarizeArticles(LATER);

      expect(releaseSummaryAttempt).not.toHaveBeenCalled();
      expect(saveArticleSummary).toHaveBeenCalledOnce();
      expect(saveArticleSummary).toHaveBeenCalledWith(2, '要約');
      expect(result).toStrictEqual({
        summarizedArticles: 1,
        failedSummaries: 1,
        summaryAborted: false,
      });
    });

    it('例外が出たら、同時に予約していた記事の試行をすべて戻し、残りは予約せずに打ち切る', async () => {
      vi.mocked(findSummaryTargets).mockResolvedValue([
        target(1, 1),
        target(2),
        target(3, 2),
        target(4),
        target(5),
      ]);
      vi.mocked(summarizeArticle).mockRejectedValue(new Error('401'));

      const result = await summarizeArticles(LATER);

      expect(reserveSummaryAttempt).toHaveBeenCalledTimes(4);
      expect(releaseSummaryAttempt).toHaveBeenCalledTimes(4);
      expect(releaseSummaryAttempt).toHaveBeenCalledWith(1, 1);
      expect(releaseSummaryAttempt).toHaveBeenCalledWith(2, 0);
      expect(releaseSummaryAttempt).toHaveBeenCalledWith(3, 2);
      expect(releaseSummaryAttempt).toHaveBeenCalledWith(4, 0);
      expect(saveArticleSummary).not.toHaveBeenCalled();
      expect(result).toStrictEqual({
        summarizedArticles: 0,
        failedSummaries: 0,
        summaryAborted: true,
      });
    });

    it('予約が DB の障害で失敗したら、戻すものは無いまま打ち切る', async () => {
      vi.mocked(findSummaryTargets).mockResolvedValue([target(1)]);
      vi.mocked(reserveSummaryAttempt).mockRejectedValue(new Error('db'));

      const result = await summarizeArticles(LATER);

      expect(summarizeArticle).not.toHaveBeenCalled();
      expect(releaseSummaryAttempt).not.toHaveBeenCalled();
      expect(result.summaryAborted).toBe(true);
    });

    it('保存に失敗したら試行を戻して打ち切る', async () => {
      vi.mocked(findSummaryTargets).mockResolvedValue([target(1)]);
      vi.mocked(saveArticleSummary).mockRejectedValue(new Error('db'));

      const result = await summarizeArticles(LATER);

      expect(releaseSummaryAttempt).toHaveBeenCalledWith(1, 0);
      expect(result.summaryAborted).toBe(true);
    });

    it('試行を戻すのにも失敗したら、ログに残して打ち切りの結果を返す', async () => {
      vi.mocked(findSummaryTargets).mockResolvedValue([target(1)]);
      vi.mocked(summarizeArticle).mockRejectedValue(new Error('401'));
      vi.mocked(releaseSummaryAttempt).mockRejectedValue(new Error('db'));

      const result = await summarizeArticles(LATER);

      expect(result.summaryAborted).toBe(true);
    });
  });

  describe('エッジケース', () => {
    it('ほかの実行が先に予約した記事は要約しない', async () => {
      vi.mocked(findSummaryTargets).mockResolvedValue([target(1)]);
      vi.mocked(reserveSummaryAttempt).mockResolvedValue(false);

      const result = await summarizeArticles(LATER);

      expect(summarizeArticle).not.toHaveBeenCalled();
      expect(result).toStrictEqual({
        summarizedArticles: 0,
        failedSummaries: 0,
        summaryAborted: false,
      });
    });

    it('ほかの実行が先に保存していたら、要約した数に数えない', async () => {
      vi.mocked(findSummaryTargets).mockResolvedValue([target(1)]);
      vi.mocked(saveArticleSummary).mockResolvedValue(false);

      const result = await summarizeArticles(LATER);

      expect(result.summarizedArticles).toBe(0);
    });

    it('処理の途中で締め切りを過ぎたら、それ以降の記事は予約しない', async () => {
      vi.mocked(findSummaryTargets).mockResolvedValue(
        Array.from({ length: 8 }, (_, i) => target(i + 1)),
      );
      vi.mocked(summarizeArticle).mockImplementation(() => {
        vi.setSystemTime(LATER);
        return Promise.resolve(summarized);
      });

      await summarizeArticles(LATER);

      // 締め切りの前に予約できたのは、同時に動いていた4件だけ
      expect(reserveSummaryAttempt).toHaveBeenCalledTimes(4);
    });

    it('締め切りを過ぎていたら予約せずに翌日へ回す', async () => {
      vi.mocked(findSummaryTargets).mockResolvedValue([target(1)]);

      const result = await summarizeArticles(NOW.getTime());

      expect(reserveSummaryAttempt).not.toHaveBeenCalled();
      expect(result.summarizedArticles).toBe(0);
    });

    it('対象が無ければ何もしない', async () => {
      vi.mocked(findSummaryTargets).mockResolvedValue([]);

      const result = await summarizeArticles(LATER);

      expect(reserveSummaryAttempt).not.toHaveBeenCalled();
      expect(result).toStrictEqual({
        summarizedArticles: 0,
        failedSummaries: 0,
        summaryAborted: false,
      });
    });
  });
});

describe('getSummaryProgress', () => {
  it('要約を選ぶときと同じ90日の窓と試行の上限で数える', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    vi.mocked(countSummaryProgress).mockResolvedValue({
      unsummarized: 5,
      summaryGaveUp: 1,
    });

    await expect(getSummaryProgress()).resolves.toStrictEqual({
      unsummarized: 5,
      summaryGaveUp: 1,
    });
    expect(countSummaryProgress).toHaveBeenCalledWith(
      '2026-07-11T00:00:00.000Z',
      3,
    );
    vi.useRealTimers();
  });
});
