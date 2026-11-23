import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { sendPushNotification } from '../../push-notification/interface/commands';
import { generateDigests } from '../application/generate-digests';
import { summarizeArticles } from '../application/summarize-articles';
import { syncArticles } from '../application/sync-articles';
import { runArticleSync } from './sync';

vi.mock('../../push-notification/interface/commands', () => ({
  sendPushNotification: vi.fn(),
}));
vi.mock('../application/generate-digests', () => ({
  generateDigests: vi.fn(),
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
    vi.mocked(summarizeArticles).mockResolvedValue({
      summarizedArticles: 3,
      failedSummaries: 1,
      summaryAborted: false,
    });
    vi.mocked(generateDigests).mockResolvedValue({
      writtenDigests: 2,
      failedDigests: 0,
      digestAborted: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('正常系', () => {
    it('取り込み・要約・まとめの結果をまとめて返し、通知を1回送る', async () => {
      const result = await runArticleSync();

      expect(result).toStrictEqual({
        newArticles: 2,
        updatedArticles: 0,
        summarizedArticles: 3,
        failedSummaries: 1,
        summaryAborted: false,
        writtenDigests: 2,
        failedDigests: 0,
        digestAborted: false,
        failedSources: [],
      });
      expect(sendPushNotification).toHaveBeenCalledOnce();
    });

    it('すべてのソースを取得できたら、追加と更新の件数を完了として通知する', async () => {
      vi.mocked(syncArticles).mockResolvedValue({
        newArticles: 2,
        updatedArticles: 1,
        failedSources: [],
      });

      await runArticleSync();

      expect(sendPushNotification).toHaveBeenCalledExactlyOnceWith({
        kind: 'readings_updated',
        title: 'フィード取得完了',
        body: '2件追加、1件更新',
        url: 'https://k8o.me/reading-list',
        dedupeKey: 'readings:2026-10-09',
      });
    });

    it('要約の締め切りは、同期を始めてから180秒後にする', async () => {
      await runArticleSync();

      expect(summarizeArticles).toHaveBeenCalledWith(NOW.getTime() + 180_000);
    });

    it('日ごとの話題は要約のあとに作り、締め切りは同期を始めてから225秒後にする', async () => {
      await runArticleSync();

      expect(generateDigests).toHaveBeenCalledWith(
        NOW.getTime(),
        NOW.getTime() + 225_000,
      );
      expect(
        vi.mocked(summarizeArticles).mock.invocationCallOrder[0],
      ).toBeLessThan(
        Number(vi.mocked(generateDigests).mock.invocationCallOrder[0]),
      );
    });
  });

  describe('異常系', () => {
    it('日ごとの話題の生成が投げても、同期の結果を返して通知を送る', async () => {
      vi.mocked(generateDigests).mockRejectedValue(new Error('db'));

      const result = await runArticleSync();

      expect(result).toMatchObject({
        newArticles: 2,
        writtenDigests: 0,
        digestAborted: true,
      });
      expect(sendPushNotification).toHaveBeenCalledOnce();
    });

    it('取得に失敗したソースがあれば、ソース名を出さずに件数だけを失敗として通知する', async () => {
      vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      vi.mocked(syncArticles).mockResolvedValue({
        newArticles: 2,
        updatedArticles: 1,
        failedSources: ['web.dev', 'WebKit'],
      });

      const result = await runArticleSync();

      expect(result.failedSources).toStrictEqual(['web.dev', 'WebKit']);
      expect(sendPushNotification).toHaveBeenCalledExactlyOnceWith({
        kind: 'readings_updated',
        title: 'フィード取得失敗',
        body: '2件追加、1件更新（2件のソースで失敗）',
        url: 'https://k8o.me/reading-list',
        dedupeKey: 'readings:2026-10-09',
      });
    });

    it('通知の送信に失敗しても、同期の結果を返す', async () => {
      vi.mocked(sendPushNotification).mockRejectedValue(new Error('push'));

      await expect(runArticleSync()).resolves.toMatchObject({ newArticles: 2 });
    });

    it('要約が例外で失敗しても、打ち切りとして返し、通知は行う', async () => {
      vi.mocked(summarizeArticles).mockRejectedValue(new Error('db'));

      const result = await runArticleSync();

      expect(result).toMatchObject({
        summarizedArticles: 0,
        failedSummaries: 0,
        summaryAborted: true,
      });
      expect(sendPushNotification).toHaveBeenCalledOnce();
    });
  });
});
