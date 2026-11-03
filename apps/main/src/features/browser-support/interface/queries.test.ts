import type {
  BaselineBrowserSupport,
  BaselineDataset,
} from '@repo/helpers/baseline/model';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { findRecentFeatureChanges } from '@/features/browser-support/infrastructure/browser-support-change-repository';
import { findActiveBaselineDataset } from '@/features/browser-support/infrastructure/browser-support-dataset-repository';

import { getBrowserSupportSnapshot, getFeatureStatus } from './queries';

vi.mock(
  '@/features/browser-support/infrastructure/browser-support-change-repository',
  () => ({ findRecentFeatureChanges: vi.fn() }),
);
vi.mock(
  '@/features/browser-support/infrastructure/browser-support-dataset-repository',
  () => ({ findActiveBaselineDataset: vi.fn() }),
);

const support: BaselineBrowserSupport[] = [
  { browser: 'chrome', version: '120', date: '2024-01-15' },
];

const dataset: BaselineDataset = {
  schemaVersion: 1,
  upstreamVersion: '3.52.0',
  features: [
    {
      featureId: 'popover',
      name: 'Popover API',
      status: 'widely',
      baselineDate: '2024-01-29',
      resolvedDate: '2024-01-29',
      support,
    },
    {
      featureId: 'text-fit',
      name: 'text-fit',
      status: 'limited',
      baselineDate: null,
      resolvedDate: '2026-06-30',
      support,
    },
    {
      featureId: 'old-limited',
      name: 'old-limited',
      status: 'limited',
      baselineDate: null,
      resolvedDate: '2024-06-30',
      support,
    },
  ],
  redirects: { 'popover-api': 'popover' },
  minVersions: { chrome: '120' },
};

const change = {
  featureId: 'text-fit',
  featureName: 'text-fit',
  status: 'newly',
  previousStatus: null,
  upstreamVersion: '3.52.0',
  changedAt: '2026-10-20T06:00:00.000Z',
} as const;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-23T00:00:00.000Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('getBrowserSupportSnapshot', () => {
  describe('正常系', () => {
    it('表示する機能・直近30日の更新・選んだ時刻を、api の GET と同じ形で返す', async () => {
      vi.mocked(findActiveBaselineDataset).mockResolvedValue({
        upstreamVersion: '3.52.0',
        ingestedAt: '2026-10-20T06:00:00.000Z',
        dataset,
      });
      vi.mocked(findRecentFeatureChanges).mockResolvedValue([change]);

      const snapshot = await getBrowserSupportSnapshot();

      expect(snapshot).toStrictEqual({
        meta: {
          upstreamVersion: '3.52.0',
          ingestedAt: '2026-10-20T06:00:00.000Z',
        },
        features: [dataset.features[0], dataset.features[1]],
        recentChanges: [change],
        nowMs: new Date('2026-10-23T00:00:00.000Z').getTime(),
      });
      expect(findRecentFeatureChanges).toHaveBeenCalledWith(
        '2026-09-23T00:00:00.000Z',
        100,
      );
    });
  });

  describe('エッジケース', () => {
    it('データの同期の前は meta を null にし、機能を空にする', async () => {
      vi.mocked(findActiveBaselineDataset).mockResolvedValue(null);
      vi.mocked(findRecentFeatureChanges).mockResolvedValue([]);

      const snapshot = await getBrowserSupportSnapshot();

      expect(snapshot).toStrictEqual({
        meta: null,
        features: [],
        recentChanges: [],
        nowMs: new Date('2026-10-23T00:00:00.000Z').getTime(),
      });
    });
  });
});

describe('getFeatureStatus', () => {
  describe('正常系', () => {
    it('旧い ID も今の機能に解決する', async () => {
      vi.mocked(findActiveBaselineDataset).mockResolvedValue({
        upstreamVersion: '3.52.0',
        ingestedAt: '2026-10-20T06:00:00.000Z',
        dataset,
      });

      await expect(getFeatureStatus('popover-api')).resolves.toStrictEqual(
        dataset.features[0],
      );
    });
  });

  describe('エッジケース', () => {
    it('データの同期の前は null を返す', async () => {
      vi.mocked(findActiveBaselineDataset).mockResolvedValue(null);

      await expect(getFeatureStatus('popover')).resolves.toBeNull();
    });
  });
});
