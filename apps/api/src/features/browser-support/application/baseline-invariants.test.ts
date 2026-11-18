import type { BaselineDataset } from '@repo/helpers/baseline/model';
import { describe, expect, it } from 'vitest';

import { checkBaselineInvariants } from './baseline-invariants';

const makeDataset = (
  overrides: Partial<BaselineDataset> = {},
): BaselineDataset => ({
  schemaVersion: 1,
  upstreamVersion: '3.34.2',
  features: [],
  redirects: {},
  minVersions: {},
  ...overrides,
});

const makeFeatures = (count: number, status: 'widely' | 'newly' = 'widely') =>
  Array.from({ length: count }, (_, i) => ({
    featureId: i === 0 ? 'flexbox' : i === 1 ? 'grid' : `feat-${String(i)}`,
    name: `Feature ${String(i)}`,
    status,
    baselineDate: '2020-01-01',
    resolvedDate: '2020-01-01',
    support: [],
  }));

describe('checkBaselineInvariants', () => {
  describe('正常系', () => {
    it('健全なデータセットは violation も warning も出さない', () => {
      const dataset = makeDataset({ features: makeFeatures(1100) });
      const result = checkBaselineInvariants({
        dataset,
        previous: makeDataset({ features: makeFeatures(1090) }),
        skippedCount: 3,
      });
      expect(result.violations).toStrictEqual([]);
      expect(result.warnings).toStrictEqual([]);
    });

    it('前回が無い初回取り込みは前回比の検査をスキップする', () => {
      const result = checkBaselineInvariants({
        dataset: makeDataset({ features: makeFeatures(1100) }),
        previous: null,
        skippedCount: 0,
      });
      expect(result.violations).toStrictEqual([]);
    });
  });

  describe('異常系', () => {
    it('feature数の絶対下限割れを検出する', () => {
      const result = checkBaselineInvariants({
        dataset: makeDataset({ features: makeFeatures(100) }),
        previous: null,
        skippedCount: 0,
      });
      expect(result.violations.some((v) => v.includes('下限を割った'))).toBe(
        true,
      );
    });

    it('番人featureの欠落を検出する', () => {
      const features = makeFeatures(1100).filter((f) => f.featureId !== 'grid');
      const result = checkBaselineInvariants({
        dataset: makeDataset({ features }),
        previous: null,
        skippedCount: 0,
      });
      expect(result.violations).toContain('番人featureが見つからない: grid');
    });

    it('前回比の激減を検出する', () => {
      const result = checkBaselineInvariants({
        dataset: makeDataset({ features: makeFeatures(900) }),
        previous: makeDataset({ features: makeFeatures(1100) }),
        skippedCount: 0,
      });
      expect(result.violations.some((v) => v.includes('激減'))).toBe(true);
    });

    it('skip過多を検出する', () => {
      const result = checkBaselineInvariants({
        dataset: makeDataset({ features: makeFeatures(1000) }),
        previous: null,
        skippedCount: 100,
      });
      expect(result.violations.some((v) => v.includes('skip数'))).toBe(true);
    });

    it('存在しないredirect先を検出する', () => {
      const result = checkBaselineInvariants({
        dataset: makeDataset({
          features: makeFeatures(1000),
          redirects: { old: 'missing' },
        }),
        previous: null,
        skippedCount: 0,
      });
      expect(
        result.violations.some((v) => v.includes('redirect先が存在しない')),
      ).toBe(true);
    });

    it('status変化の異常な多さを検出する', () => {
      const previous = makeDataset({ features: makeFeatures(1000) });
      const result = checkBaselineInvariants({
        dataset: makeDataset({ features: makeFeatures(1000, 'newly') }),
        previous,
        skippedCount: 0,
      });
      expect(
        result.violations.some((v) => v.includes('status変化が異常に多い')),
      ).toBe(true);
    });
  });

  describe('エッジケース', () => {
    it('minVersionsの後退は violation ではなく warning にする', () => {
      const result = checkBaselineInvariants({
        dataset: makeDataset({
          features: makeFeatures(1100),
          minVersions: { chrome: '100' },
        }),
        previous: makeDataset({
          features: makeFeatures(1100),
          minVersions: { chrome: '120' },
        }),
        skippedCount: 0,
      });
      expect(result.violations).toStrictEqual([]);
      expect(
        result.warnings.some((w) => w.includes('minVersionsが下がった')),
      ).toBe(true);
    });
  });
});
