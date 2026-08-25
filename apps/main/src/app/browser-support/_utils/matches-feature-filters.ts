import type {
  BrowserSupportFeature,
  SupportStatus,
} from '@/features/browser-support/interface/queries';
import { matchesSearchQuery } from '@/shared/search/search-filter';

export type StatusVisibility = Record<SupportStatus, boolean>;

export type FeatureFilters = {
  visibility: StatusVisibility;
  query: string;
  recentOnly: boolean;
  recentThresholdMs: number;
};

// 一覧の表示とタブの年別件数が同じ条件で数えられるよう、絞り込み述語を一本化する。
export const matchesFeatureFilters = (
  feature: BrowserSupportFeature,
  { visibility, query, recentOnly, recentThresholdMs }: FeatureFilters,
): boolean => {
  if (!visibility[feature.status]) {
    return false;
  }
  if (
    recentOnly &&
    new Date(feature.resolvedDate).getTime() < recentThresholdMs
  ) {
    return false;
  }
  return matchesSearchQuery(query, [feature.name, feature.featureId]);
};
