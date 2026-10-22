import type { BaselineDataset, BaselineFeature } from './model';

// baseline 未達(limited)は「直近1年でブラウザが動いた」ものだけをフィードに載せ、
// 何年も単一ブラウザのままの古い機能を除外する。
const RECENT_LIMITED_WINDOW_MS = 365 * 24 * 60 * 60 * 1000;

// 「最近の更新」の表示窓。同期時に記録した changedAt 基準なので、上流の baseline
// 日付のラグに左右されず「このサイトが取り込んだ時点」からの新しさで絞れる。
export const RECENT_CHANGES_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
// 上流の一括再計算などで異常に膨らんだ場合の表示上限
export const RECENT_CHANGES_LIMIT = 100;

// features は取り込み時に resolvedDate 降順で保存されているため、ここでは並べ替えない。
export const selectFeedFeatures = (
  dataset: BaselineDataset,
  nowMs: number,
): BaselineFeature[] => {
  const recentCutoff = nowMs - RECENT_LIMITED_WINDOW_MS;
  return dataset.features.filter((feature) => {
    // 日付が定まらない機能はフィード(年別・整列)に載せない。
    if (feature.resolvedDate === '') {
      return false;
    }
    if (
      feature.status === 'limited' &&
      new Date(feature.resolvedDate).getTime() < recentCutoff
    ) {
      return false;
    }
    return true;
  });
};

// MDX の <BrowserSupportStatus featureId="..."> 用。旧 ID は取り込み時に解決済みの
// redirects で新 ID へ辿る(ブログ記事が旧 ID を参照し続けられる保証)。
export const selectFeatureStatus = (
  dataset: BaselineDataset,
  featureId: string,
): BaselineFeature | null => {
  const direct = dataset.features.find((f) => f.featureId === featureId);
  if (direct !== undefined) {
    return direct;
  }
  const target = dataset.redirects[featureId];
  if (target === undefined) {
    return null;
  }
  return dataset.features.find((f) => f.featureId === target) ?? null;
};

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

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
}
