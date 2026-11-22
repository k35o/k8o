import type { BaselineDataset } from '@repo/helpers/baseline/model';
import { compareVersions } from '@repo/helpers/browser/compare-versions';
import { CORE_BROWSERS } from '@repo/helpers/browser/core-browsers';

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
