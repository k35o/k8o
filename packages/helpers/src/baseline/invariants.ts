import { compareVersions } from '../browser/browser-support';
import { CORE_BROWSERS } from '../browser/detect-browser';
import type { BaselineDataset } from './model';

// 形式検証(スキーマ)を通っても「意味的に壊れたデータ」で全量置換してしまう事故を防ぐ
// 最後の関門。violations は取り込み中断(前回データ維持)、warnings は取り込みつつ警報。

export type BaselineInvariantResult = {
  violations: string[];
  warnings: string[];
};

// 2026 年時点で上流は ~1,100 features。半分以下になるのは取得・変換の事故とみなす。
const ABSOLUTE_MIN_FEATURES = 800;
// 実在し続けるはずの番人 feature。消えたら ID 体系ごと壊れている。
const SENTINEL_FEATURE_IDS = ['flexbox', 'grid'];
const MAX_SKIP_RATIO = 0.05;
const MAX_SHRINK_RATIO = 0.9;
const MAX_STATUS_CHANGE_RATIO = 0.3;

export const checkBaselineInvariants = ({
  dataset,
  previous,
  skippedCount,
}: {
  dataset: BaselineDataset;
  previous: BaselineDataset | null;
  skippedCount: number;
}): BaselineInvariantResult => {
  const violations: string[] = [];
  const warnings: string[] = [];
  const count = dataset.features.length;

  if (count < ABSOLUTE_MIN_FEATURES) {
    violations.push(
      `feature数が下限を割った: ${String(count)} < ${String(ABSOLUTE_MIN_FEATURES)}`,
    );
  }

  const featureIds = new Set(dataset.features.map((f) => f.featureId));
  for (const sentinel of SENTINEL_FEATURE_IDS) {
    if (!featureIds.has(sentinel)) {
      violations.push(`番人featureが見つからない: ${sentinel}`);
    }
  }

  if (count > 0 && skippedCount > count * MAX_SKIP_RATIO) {
    violations.push(
      `skip数が許容比を超えた(上流フォーマットのドリフト疑い): ${String(skippedCount)}件`,
    );
  }

  for (const [from, to] of Object.entries(dataset.redirects)) {
    if (!featureIds.has(to)) {
      violations.push(`redirect先が存在しない: ${from} -> ${to}`);
    }
  }

  if (previous !== null) {
    const prevCount = previous.features.length;
    if (count < prevCount * MAX_SHRINK_RATIO) {
      violations.push(
        `feature数が前回比で激減した: ${String(prevCount)} -> ${String(count)}`,
      );
    }

    const prevStatus = new Map(
      previous.features.map((f) => [f.featureId, f.status]),
    );
    let statusChanges = 0;
    let common = 0;
    for (const feature of dataset.features) {
      const prev = prevStatus.get(feature.featureId);
      if (prev === undefined) {
        continue;
      }
      common += 1;
      if (prev !== feature.status) {
        statusChanges += 1;
      }
    }
    if (common > 0 && statusChanges > common * MAX_STATUS_CHANGE_RATIO) {
      violations.push(
        `status変化が異常に多い: ${String(statusChanges)}/${String(common)}件`,
      );
    }

    // フロアは通常単調に上がる。下がるのは上流のデータ修正でもありうるため、
    // 取り込みは止めず警報だけ出して人間が確認する。
    for (const browser of CORE_BROWSERS) {
      const prevMin = previous.minVersions[browser];
      const nextMin = dataset.minVersions[browser];
      if (
        prevMin !== undefined &&
        nextMin !== undefined &&
        compareVersions(nextMin, prevMin) < 0
      ) {
        warnings.push(
          `minVersionsが下がった: ${browser} ${prevMin} -> ${nextMin}`,
        );
      }
    }
  }

  return { violations, warnings };
};

if (import.meta.vitest) {
  // oxlint-disable-next-line unicorn/consistent-function-scoping -- テスト専用ファクトリを本番コードのスコープに出さない
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

  // oxlint-disable-next-line unicorn/consistent-function-scoping -- テスト専用ファクトリを本番コードのスコープに出さない
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
        const features = makeFeatures(1100).filter(
          (f) => f.featureId !== 'grid',
        );
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
}
