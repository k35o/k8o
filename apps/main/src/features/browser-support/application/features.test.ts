import type {
  BaselineDataset,
  BaselineFeature,
} from '@repo/helpers/baseline/model';

import { selectFeatureStatus, selectFeedFeatures } from './features';

const feature = (
  featureId: string,
  status: BaselineFeature['status'],
  resolvedDate: string,
): BaselineFeature => ({
  featureId,
  name: featureId,
  status,
  baselineDate: status === 'limited' ? null : resolvedDate || null,
  resolvedDate,
  support: [{ browser: 'chrome', version: '120', date: '2024-01-15' }],
});

// 取り込み時の保存順(resolvedDate 降順)を再現した fixture。
const dataset: BaselineDataset = {
  schemaVersion: 1,
  upstreamVersion: '3.34.2',
  features: [
    feature('newly-feat', 'newly', '2026-04-01'),
    feature('limited-recent', 'limited', '2026-03-01'),
    feature('widely-feat', 'widely', '2023-07-01'),
    feature('limited-old', 'limited', '2024-01-15'),
    feature('no-date', 'limited', ''),
  ],
  redirects: { 'moved-entry': 'widely-feat' },
  minVersions: { chrome: '120' },
};

// 2026-07-20 UTC。直近1年の境界は 2025-07-20。
const NOW_MS = new Date('2026-07-20T00:00:00Z').getTime();

describe('selectFeedFeatures', () => {
  describe('正常系', () => {
    it('baseline 機能と直近1年に動いた limited をフィードに載せる', () => {
      const result = selectFeedFeatures(dataset, NOW_MS);
      expect(result.map((f) => f.featureId)).toStrictEqual([
        'newly-feat',
        'limited-recent',
        'widely-feat',
      ]);
    });
  });

  describe('エッジケース', () => {
    it('1年以上動いていない limited は除外する', () => {
      const result = selectFeedFeatures(dataset, NOW_MS);
      expect(result.some((f) => f.featureId === 'limited-old')).toBe(false);
    });

    it('日付が定まらない機能は除外する', () => {
      const result = selectFeedFeatures(dataset, NOW_MS);
      expect(result.some((f) => f.featureId === 'no-date')).toBe(false);
    });

    it('baseline 機能は古くても除外しない', () => {
      const result = selectFeedFeatures(dataset, NOW_MS);
      expect(result.some((f) => f.featureId === 'widely-feat')).toBe(true);
    });
  });
});

describe('selectFeatureStatus', () => {
  describe('正常系', () => {
    it('feature ID を直接解決する', () => {
      const result = selectFeatureStatus(dataset, 'widely-feat');
      expect(result?.featureId).toBe('widely-feat');
      expect(result?.status).toBe('widely');
    });

    it('moved/split の旧 ID を redirects 経由で解決する', () => {
      const result = selectFeatureStatus(dataset, 'moved-entry');
      expect(result?.featureId).toBe('widely-feat');
    });
  });

  describe('異常系', () => {
    it('未知の ID は null を返す', () => {
      expect(selectFeatureStatus(dataset, 'unknown-feat')).toBeNull();
    });

    it('redirect 先が存在しない場合は null を返す', () => {
      const broken: BaselineDataset = {
        ...dataset,
        redirects: { orphan: 'missing-feat' },
      };
      expect(selectFeatureStatus(broken, 'orphan')).toBeNull();
    });
  });
});
