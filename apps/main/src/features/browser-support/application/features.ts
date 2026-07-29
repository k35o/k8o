import type {
  BaselineBrowserSupport,
  BaselineDataset,
  BaselineFeature,
  BaselineSupportStatus,
} from '@repo/helpers/baseline/model';

// 既存の呼び出し側(app/**/_components)が使う名前を維持する。実体は取り込み時に
// 正規化済みの自前モデルで、この層は読み取り時の絞り込みと解決だけを行う。
export type BrowserSupportFeature = BaselineFeature;
export type SupportStatus = BaselineSupportStatus;
export type BrowserAvailability = BaselineBrowserSupport;

// baseline 未達(limited)は「直近1年でブラウザが動いた」ものだけをフィードに載せ、
// 何年も単一ブラウザのままの古い機能を除外する。
const RECENT_LIMITED_WINDOW_MS = 365 * 24 * 60 * 60 * 1000;

// features は取り込み時に resolvedDate 降順で保存されているため、ここでは並べ替えない。
export const selectFeedFeatures = (
  dataset: BaselineDataset,
  nowMs: number,
): BrowserSupportFeature[] => {
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
): BrowserSupportFeature | null => {
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
