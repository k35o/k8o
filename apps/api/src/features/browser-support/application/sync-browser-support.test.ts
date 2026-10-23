import { checkBaselineInvariants } from '@repo/helpers/baseline/invariants';
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
import {
  diffBaselineFeatures,
  syncBrowserSupport,
  toFeatureChangeRows,
} from './sync-browser-support';

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
vi.mock('@repo/helpers/baseline/invariants', () => ({
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

describe('diffBaselineFeatures', () => {
  describe('正常系', () => {
    it('前回に無い baseline 機能は reached に入る', () => {
      const diff = diffBaselineFeatures([feature('a', 'newly')], []);
      expect(diff.reached.map((f) => f.featureId)).toStrictEqual(['a']);
      expect(diff.statusChanges).toStrictEqual([]);
    });

    it('limited から baseline への到達も reached に入る', () => {
      const diff = diffBaselineFeatures(
        [feature('a', 'newly')],
        [feature('a', 'limited')],
      );
      expect(diff.reached.map((f) => f.featureId)).toStrictEqual(['a']);
    });

    it('newly から widely への変化は statusChanges に入る', () => {
      const diff = diffBaselineFeatures(
        [feature('a', 'widely')],
        [feature('a', 'newly')],
      );
      expect(diff.reached).toStrictEqual([]);
      expect(diff.statusChanges).toStrictEqual([
        { feature: feature('a', 'widely'), previousStatus: 'newly' },
      ]);
    });
  });

  describe('異常系・エッジケース', () => {
    it('status が同じなら差分なし', () => {
      const diff = diffBaselineFeatures(
        [feature('a', 'newly')],
        [feature('a', 'newly')],
      );
      expect(diff.reached).toStrictEqual([]);
      expect(diff.statusChanges).toStrictEqual([]);
    });

    it('limited のままの機能は通知対象にしない', () => {
      const diff = diffBaselineFeatures(
        [feature('a', 'limited')],
        [feature('b', 'limited')],
      );
      expect(diff.reached).toStrictEqual([]);
      expect(diff.statusChanges).toStrictEqual([]);
    });

    it('現在集合が空なら差分なし', () => {
      const diff = diffBaselineFeatures([], [feature('a', 'newly')]);
      expect(diff.reached).toStrictEqual([]);
      expect(diff.statusChanges).toStrictEqual([]);
    });
  });
});

describe('toFeatureChangeRows', () => {
  describe('正常系', () => {
    it('baseline 到達は previousStatus null の行になる', () => {
      const diff = diffBaselineFeatures(
        [feature('a', 'newly')],
        [feature('a', 'limited')],
      );
      expect(toFeatureChangeRows(diff)).toStrictEqual([
        {
          featureId: 'a',
          featureName: 'a',
          status: 'newly',
          previousStatus: null,
        },
      ]);
    });

    it('baseline 内の遷移は previousStatus 付きの行になる', () => {
      const diff = diffBaselineFeatures(
        [feature('a', 'widely')],
        [feature('a', 'newly')],
      );
      expect(toFeatureChangeRows(diff)).toStrictEqual([
        {
          featureId: 'a',
          featureName: 'a',
          status: 'widely',
          previousStatus: 'newly',
        },
      ]);
    });

    it('到達と遷移が混在しても両方の行を作る', () => {
      const diff = diffBaselineFeatures(
        [feature('a', 'newly'), feature('b', 'widely')],
        [feature('b', 'newly')],
      );
      expect(
        toFeatureChangeRows(diff).map((row) => row.featureId),
      ).toStrictEqual(['a', 'b']);
    });
  });

  describe('エッジケース', () => {
    it('差分が空なら行を作らない', () => {
      const diff = diffBaselineFeatures(
        [feature('a', 'newly')],
        [feature('a', 'newly')],
      );
      expect(toFeatureChangeRows(diff)).toStrictEqual([]);
    });
  });
});

const makeDataset = (features: BaselineFeature[]): BaselineDataset => ({
  schemaVersion: 1,
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
  });
});
