import type { BaselineFeature } from '@repo/helpers/baseline/model';
import { describe, expect, it } from 'vitest';

import {
  countDiff,
  diffBaselineFeatures,
  hasDiff,
  minVersionsChanged,
  toFeatureChangeRows,
} from './baseline-diff';

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

describe('countDiff', () => {
  describe('正常系', () => {
    it('到達を newly と widely に分けて数え、遷移の件数を数える', () => {
      const diff = diffBaselineFeatures(
        [
          feature('a', 'newly'),
          feature('b', 'newly'),
          feature('c', 'widely'),
          feature('d', 'widely'),
        ],
        [feature('d', 'newly')],
      );

      expect(countDiff(diff)).toStrictEqual({
        newlyCount: 2,
        widelyCount: 1,
        statusChangeCount: 1,
      });
    });
  });
});

describe('hasDiff', () => {
  describe('正常系', () => {
    it('到達か遷移があれば true', () => {
      expect(hasDiff(diffBaselineFeatures([feature('a', 'newly')], []))).toBe(
        true,
      );
      expect(
        hasDiff(
          diffBaselineFeatures(
            [feature('a', 'widely')],
            [feature('a', 'newly')],
          ),
        ),
      ).toBe(true);
    });
  });

  describe('エッジケース', () => {
    it('どちらも無ければ false', () => {
      expect(hasDiff({ reached: [], statusChanges: [] })).toBe(false);
    });
  });
});

describe('minVersionsChanged', () => {
  describe('正常系', () => {
    it('同じ版なら false', () => {
      expect(
        minVersionsChanged(
          { chrome: '120', safari: '17.2' },
          { safari: '17.2', chrome: '120' },
        ),
      ).toBe(false);
    });

    it('版が変わったら true', () => {
      expect(minVersionsChanged({ chrome: '120' }, { chrome: '121' })).toBe(
        true,
      );
    });
  });

  describe('エッジケース', () => {
    it('ブラウザが増減したら true', () => {
      expect(minVersionsChanged({ chrome: '120' }, {})).toBe(true);
      expect(minVersionsChanged({}, { chrome: '120' })).toBe(true);
    });

    it('どちらも空なら false', () => {
      expect(minVersionsChanged({}, {})).toBe(false);
    });
  });
});
