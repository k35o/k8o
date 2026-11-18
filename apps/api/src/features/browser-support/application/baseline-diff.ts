import type { BaselineFeature } from '@repo/helpers/baseline/model';

import type { FeatureChangeInput } from '../infrastructure/browser-support-repository';

// baseline(newly/widely) に到達済みの feature。diff の構築時点で limited を
// 除外済みであることを型で運び、下流の防御的な再チェックを不要にする。
type BaselineReachedFeature = BaselineFeature & {
  status: 'newly' | 'widely';
};

export type BaselineDiff = {
  // baseline(newly/widely)に新規到達した feature
  reached: BaselineReachedFeature[];
  // newly -> widely などの baseline 内ステータス変化
  statusChanges: Array<{
    feature: BaselineReachedFeature;
    previousStatus: 'newly' | 'widely';
  }>;
};

export type BaselineDiffCounts = {
  newlyCount: number;
  widelyCount: number;
  statusChangeCount: number;
};

// 通知用の差分。前回データセットとの比較で「新規 baseline 到達」と「ステータス変化」を
// 抽出する。limited のままの変化は通知対象にしない(従来仕様)。
export const diffBaselineFeatures = (
  current: BaselineFeature[],
  previous: BaselineFeature[],
): BaselineDiff => {
  const previousStatusById = new Map(
    previous.map((f) => [f.featureId, f.status]),
  );
  const reached: BaselineReachedFeature[] = [];
  const statusChanges: BaselineDiff['statusChanges'] = [];

  for (const feature of current) {
    if (feature.status === 'limited') {
      continue;
    }
    const reachedFeature = { ...feature, status: feature.status };
    const prev = previousStatusById.get(feature.featureId);
    if (prev === undefined || prev === 'limited') {
      reached.push(reachedFeature);
      continue;
    }
    if (prev !== feature.status) {
      statusChanges.push({ feature: reachedFeature, previousStatus: prev });
    }
  }

  return { reached, statusChanges };
};

export const toFeatureChangeRows = (
  diff: BaselineDiff,
): FeatureChangeInput[] => {
  const rows: FeatureChangeInput[] = [];
  for (const feature of diff.reached) {
    rows.push({
      featureId: feature.featureId,
      featureName: feature.name,
      status: feature.status,
      previousStatus: null,
    });
  }
  for (const { feature, previousStatus } of diff.statusChanges) {
    rows.push({
      featureId: feature.featureId,
      featureName: feature.name,
      status: feature.status,
      previousStatus,
    });
  }
  return rows;
};

export const countDiff = (diff: BaselineDiff): BaselineDiffCounts => ({
  newlyCount: diff.reached.filter((f) => f.status === 'newly').length,
  widelyCount: diff.reached.filter((f) => f.status === 'widely').length,
  statusChangeCount: diff.statusChanges.length,
});

export const hasDiff = (diff: BaselineDiff): boolean =>
  diff.reached.length > 0 || diff.statusChanges.length > 0;

export const minVersionsChanged = (
  prev: Record<string, string | undefined>,
  next: Record<string, string | undefined>,
): boolean => {
  const keys = new Set([...Object.keys(prev), ...Object.keys(next)]);
  for (const key of keys) {
    if (prev[key] !== next[key]) {
      return true;
    }
  }
  return false;
};
