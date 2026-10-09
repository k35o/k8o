import { revalidateMainCache } from '../../../shared/cache/revalidate-main';
import { sendPushNotification } from '../../push-notification/interface/commands';
import { enrichArticleMetadata } from '../application/enrich-articles';
import { summarizeArticles } from '../application/summarize-articles';
import { syncArticles } from '../application/sync-articles';
import { runArticleSync } from './sync';

vi.mock('../../../shared/cache/revalidate-main', () => ({
  revalidateMainCache: vi.fn(),
}));
vi.mock('../../push-notification/interface/commands', () => ({
  sendPushNotification: vi.fn(),
}));
vi.mock('../application/enrich-articles', () => ({
  enrichArticleMetadata: vi.fn(),
}));
vi.mock('../application/summarize-articles', () => ({
  summarizeArticles: vi.fn(),
}));
vi.mock('../application/sync-articles', () => ({
  syncArticles: vi.fn(),
}));

const NOW = new Date('2026-10-09T00:00:00.000Z');

describe('runArticleSync', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.mocked(syncArticles).mockResolvedValue({
      newArticles: 2,
      updatedArticles: 0,
      failedSources: [],
    });
    vi.mocked(enrichArticleMetadata).mockResolvedValue({ enrichedArticles: 1 });
    vi.mocked(summarizeArticles).mockResolvedValue({
      summarizedArticles: 3,
      failedSummaries: 1,
      summaryAborted: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('正常系', () => {
    it('取り込み・補完・要約の結果をまとめて返し、要約の後に再検証する', async () => {
      const result = await runArticleSync();

      expect(result).toStrictEqual({
        newArticles: 2,
        updatedArticles: 0,
        enrichedArticles: 1,
        summarizedArticles: 3,
        failedSummaries: 1,
        summaryAborted: false,
        failedSources: [],
      });
      const [summarizedAt] =
        vi.mocked(summarizeArticles).mock.invocationCallOrder;
      const [revalidatedAt] =
        vi.mocked(revalidateMainCache).mock.invocationCallOrder;
      expect(summarizedAt).toBeLessThan(Number(revalidatedAt));
      expect(sendPushNotification).toHaveBeenCalledOnce();
    });

    it('要約の締め切りは、同期を始めてから180秒後にする', async () => {
      await runArticleSync();

      expect(summarizeArticles).toHaveBeenCalledWith(NOW.getTime() + 180_000);
    });
  });

  describe('異常系', () => {
    it('要約が例外で失敗しても、打ち切りとして返し、再検証と通知は行う', async () => {
      vi.mocked(summarizeArticles).mockRejectedValue(new Error('db'));

      const result = await runArticleSync();

      expect(result).toMatchObject({
        summarizedArticles: 0,
        failedSummaries: 0,
        summaryAborted: true,
      });
      expect(revalidateMainCache).toHaveBeenCalledOnce();
      expect(sendPushNotification).toHaveBeenCalledOnce();
    });
  });
});
