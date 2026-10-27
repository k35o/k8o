import type {
  BaselineBrowserSupport,
  BaselineDataset,
} from '@repo/helpers/baseline/model';
import { describe, expect, it, vi } from 'vitest';

import { findActiveBaselineDataset } from '@/features/browser-support/infrastructure/browser-support-dataset-repository';

import { getFeatureStatus } from './queries';

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
  ],
  redirects: { 'popover-api': 'popover' },
  minVersions: { chrome: '120' },
};

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
