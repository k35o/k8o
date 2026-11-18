import type {
  BaselineDataset,
  BaselineFeature,
} from '@repo/helpers/baseline/model';

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
