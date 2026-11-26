import type {
  BaselineDataset,
  BaselineFeature,
} from '@repo/helpers/baseline/model';
import { transformUpstreamData } from '@repo/helpers/baseline/transform-upstream';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  applyDataset,
  findActiveDataset,
  recordSyncRun,
} from '../infrastructure/browser-support-repository';
import {
  discoverLatestVersion,
  fetchUpstreamData,
} from '../infrastructure/upstream-release-source';
import { checkBaselineInvariants } from './baseline-invariants';
import { syncBrowserSupport } from './sync-browser-support';

// infrastructure と helpers をモックし、実 DB クライアントや外部通信なしで
// application 層のオーケストレーション(通知・記録の分岐)を検証する。
vi.mock('../infrastructure/browser-support-repository', () => ({
  applyDataset: vi.fn(),
  findActiveDataset: vi.fn(),
  recordSyncRun: vi.fn(),
}));
vi.mock('../infrastructure/upstream-release-source', () => ({
  discoverLatestVersion: vi.fn(),
  fetchUpstreamData: vi.fn(),
  UpstreamDiscoveryError: class UpstreamDiscoveryError extends Error {},
}));
vi.mock('@repo/helpers/baseline/transform-upstream', () => ({
  transformUpstreamData: vi.fn(),
  UpstreamFormatError: class UpstreamFormatError extends Error {},
}));
vi.mock('./baseline-invariants', () => ({
  checkBaselineInvariants: vi.fn(),
}));

const feature = (
  featureId: string,
  status: BaselineFeature['status'],
  date = '2026-01-01',
): BaselineFeature => ({
  featureId,
  name: featureId,
  status,
  baselineDate: status === 'limited' ? null : date,
  resolvedDate: date,
  support: [],
});

const makeDataset = (features: BaselineFeature[]): BaselineDataset => ({
  schemaVersion: 2,
  upstreamVersion: '3.2.0',
  features,
  redirects: {},
  minVersions: {},
});

describe('syncBrowserSupport', () => {
  const notify =
    vi.fn<
      (notification: {
        kind: 'update' | 'alert';
        title: string;
        body: string;
        dedupeKey: string;
      }) => Promise<void>
    >();

  beforeEach(() => {
    vi.clearAllMocks();
    notify.mockResolvedValue(undefined);
    vi.mocked(discoverLatestVersion).mockResolvedValue({
      version: '3.2.0',
      major: 3,
    });
    // 前回と同一 features にして、update 通知が出ない取り込みにする
    vi.mocked(findActiveDataset).mockResolvedValue({
      id: 1,
      upstreamVersion: '3.1.0',
      ingestedAt: new Date().toISOString(),
      dataset: makeDataset([feature('a', 'newly')]),
    });
    vi.mocked(fetchUpstreamData).mockResolvedValue({});
    vi.mocked(transformUpstreamData).mockReturnValue({
      dataset: makeDataset([feature('a', 'newly')]),
      skippedFeatures: [],
    });
    vi.mocked(checkBaselineInvariants).mockReturnValue({
      violations: [],
      warnings: [],
    });
    vi.mocked(applyDataset).mockResolvedValue(undefined);
    vi.mocked(recordSyncRun).mockResolvedValue(undefined);
  });

  describe('正常系', () => {
    it('機能の状態が前回と変わらない新しい版は、取り込んで applied を返し、通知しない', async () => {
      const summary = await syncBrowserSupport({ trigger: 'cron', notify });

      expect(summary.result).toBe('applied');
      expect(applyDataset).toHaveBeenCalledOnce();
      expect(notify).not.toHaveBeenCalled();
    });
    it('機能が baseline に届き、フロアが変わり、警告があれば、更新・フロア・警告の順に通知する', async () => {
      vi.mocked(transformUpstreamData).mockReturnValue({
        dataset: {
          ...makeDataset([feature('a', 'widely'), feature('b', 'newly')]),
          minVersions: { chrome: '121' },
        },
        skippedFeatures: [{ featureId: 'x', reason: 'unknown kind' }],
      });
      vi.mocked(checkBaselineInvariants).mockReturnValue({
        violations: [],
        warnings: ['minVersionsが下がった: chrome 122 -> 121'],
      });

      const summary = await syncBrowserSupport({ trigger: 'cron', notify });

      expect(summary).toStrictEqual({
        newlyCount: 1,
        widelyCount: 0,
        statusChangeCount: 1,
        result: 'applied',
        upstreamVersion: '3.2.0',
        detail: 'skipped: 1件',
      });
      expect(
        notify.mock.calls.map(([notification]) => notification),
      ).toStrictEqual([
        {
          kind: 'update',
          title: 'Browser Support更新',
          body: 'Newly: 1件、ステータス変更: 1件',
          dedupeKey: 'browser-support:v3.2.0',
        },
        {
          kind: 'alert',
          title: 'Browser Support: 最低対応バージョンが変化',
          body: 'v3.2.0 でブラウザ最低版フロアが変わりました。外形監視が再生成PRを自動で作成し、CI通過後にマージされます。',
          dedupeKey: 'browser-support:alert:min-versions:v3.2.0',
        },
        {
          kind: 'alert',
          title: 'Browser Support同期: 警告',
          body: 'v3.2.0: minVersionsが下がった: chrome 122 -> 121',
          dedupeKey: 'browser-support:alert:warning:v3.2.0',
        },
      ]);
      expect(applyDataset).toHaveBeenCalledWith(expect.anything(), [
        {
          featureId: 'b',
          featureName: 'b',
          status: 'newly',
          previousStatus: null,
        },
        {
          featureId: 'a',
          featureName: 'a',
          status: 'widely',
          previousStatus: 'newly',
        },
      ]);
    });

    it('取り込み済みの版なら noop を返し、通知しない', async () => {
      vi.mocked(discoverLatestVersion).mockResolvedValue({
        version: '3.1.0',
        major: 3,
      });

      const summary = await syncBrowserSupport({ trigger: 'cron', notify });

      expect(summary.result).toBe('noop');
      expect(applyDataset).not.toHaveBeenCalled();
      expect(notify).not.toHaveBeenCalled();
    });
  });

  describe('異常系', () => {
    it('上流のメジャーが変わったら取り込まず、メジャーごとに1回だけ警報する', async () => {
      vi.mocked(discoverLatestVersion).mockResolvedValue({
        version: '4.0.1',
        major: 4,
      });

      const summary = await syncBrowserSupport({ trigger: 'cron', notify });

      expect(summary).toMatchObject({
        result: 'skipped_major',
        upstreamVersion: '4.0.1',
        detail: 'supported=3',
      });
      expect(notify).toHaveBeenCalledExactlyOnceWith({
        kind: 'alert',
        title: 'Browser Support同期: 上流メジャーバージョン変化',
        body: 'web-features v4.0.1 が公開されています。変換・検証の対応後に SUPPORTED_MAJOR を更新してください。それまで前回データで表示を継続します。',
        dedupeKey: 'browser-support:alert:major:v4',
      });
      expect(applyDataset).not.toHaveBeenCalled();
    });

    it('検証で違反があれば取り込まず、違反の内容を警報する', async () => {
      vi.mocked(checkBaselineInvariants).mockReturnValue({
        violations: ['番人featureが見つからない: grid', 'skip数が多い'],
        warnings: [],
      });

      const summary = await syncBrowserSupport({ trigger: 'cron', notify });

      expect(summary).toMatchObject({
        result: 'validation_failed',
        detail: '番人featureが見つからない: grid / skip数が多い',
      });
      expect(notify).toHaveBeenCalledExactlyOnceWith({
        kind: 'alert',
        title: 'Browser Support同期: 検証で拒否',
        body: 'v3.2.0: 番人featureが見つからない: grid / skip数が多い',
        dedupeKey: 'browser-support:alert:invariant:v3.2.0',
      });
      expect(applyDataset).not.toHaveBeenCalled();
    });

    it('取得に失敗したら fetch_failed を返し、通知しない', async () => {
      vi.mocked(fetchUpstreamData).mockRejectedValue(new Error('timeout'));

      const summary = await syncBrowserSupport({ trigger: 'cron', notify });

      expect(summary).toMatchObject({
        result: 'fetch_failed',
        upstreamVersion: '3.2.0',
        detail: 'Error: timeout',
      });
      expect(notify).not.toHaveBeenCalled();
    });
  });

  describe('エッジケース', () => {
    it('取り込み済みの版が45日を超えて変わらなければ、上流の停滞を警報する', async () => {
      vi.mocked(discoverLatestVersion).mockResolvedValue({
        version: '3.1.0',
        major: 3,
      });
      vi.mocked(findActiveDataset).mockResolvedValue({
        id: 1,
        upstreamVersion: '3.1.0',
        ingestedAt: new Date(
          Date.now() - 46 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        dataset: makeDataset([feature('a', 'newly')]),
      });

      const summary = await syncBrowserSupport({ trigger: 'cron', notify });

      expect(summary.result).toBe('noop');
      expect(notify).toHaveBeenCalledExactlyOnceWith({
        kind: 'alert',
        title: 'Browser Support同期: 上流リリースが停滞',
        body: 'web-features が 45 日以上更新されていません(現行 v3.1.0)。上流の動向を確認してください。',
        dedupeKey: 'browser-support:alert:stale:v3.1.0',
      });
    });

    it('初回の取り込みは、全件が新規になるので更新を通知しない', async () => {
      vi.mocked(findActiveDataset).mockResolvedValue(null);

      const summary = await syncBrowserSupport({ trigger: 'cron', notify });

      expect(summary).toMatchObject({
        result: 'applied',
        newlyCount: 0,
        widelyCount: 0,
        statusChangeCount: 0,
      });
      expect(applyDataset).toHaveBeenCalledWith(expect.anything(), []);
      expect(notify).not.toHaveBeenCalled();
    });
  });
});
