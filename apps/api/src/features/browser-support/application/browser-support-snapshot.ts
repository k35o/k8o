import type { BaselineFeature } from '@repo/helpers/baseline/model';

import {
  findActiveDataset,
  findRecentFeatureChanges,
} from '../infrastructure/browser-support-repository';
import type {
  ActiveDatasetMeta,
  BrowserSupportFeatureChange,
} from '../infrastructure/browser-support-repository';
import {
  RECENT_CHANGES_LIMIT,
  RECENT_CHANGES_WINDOW_MS,
  selectFeatureStatus,
  selectFeedFeatures,
} from './baseline-select';
import type { FeedFeature } from './baseline-select';

type BrowserSupportSnapshot = {
  dataset: ActiveDatasetMeta | null;
  features: FeedFeature[];
  recentChanges: BrowserSupportFeatureChange[];
  // 機能を選んだ時刻。CDN に置かれた応答を読む側も、この時刻を基準に新しさを数える
  generatedAt: string;
};

const findRecentChanges = (
  nowMs: number,
): Promise<BrowserSupportFeatureChange[]> =>
  findRecentFeatureChanges(
    new Date(nowMs - RECENT_CHANGES_WINDOW_MS).toISOString(),
    RECENT_CHANGES_LIMIT,
  );

export const getBrowserSupportRecentChanges = async (
  nowMs: number,
): Promise<{ recentChanges: BrowserSupportFeatureChange[] }> => ({
  recentChanges: await findRecentChanges(nowMs),
});

export const getBrowserSupportSnapshot = async (
  nowMs: number,
): Promise<BrowserSupportSnapshot> => {
  const [active, recentChanges] = await Promise.all([
    findActiveDataset(),
    findRecentChanges(nowMs),
  ]);
  const generatedAt = new Date(nowMs).toISOString();
  if (active === null) {
    return { dataset: null, features: [], recentChanges, generatedAt };
  }
  return {
    dataset: {
      upstreamVersion: active.upstreamVersion,
      ingestedAt: active.ingestedAt,
    },
    features: selectFeedFeatures(active.dataset, nowMs),
    recentChanges,
    generatedAt,
  };
};

// main のビルドは記事ごとに機能を引くので、データセットを 1 回だけ読んで引く関数を返す
export const loadFeatureStatusLookup = async (): Promise<
  (featureId: string) => BaselineFeature | null
> => {
  const active = await findActiveDataset();
  return (featureId) =>
    active === null ? null : selectFeatureStatus(active.dataset, featureId);
};

export const findFeatureStatus = async (
  featureId: string,
): Promise<BaselineFeature | null> =>
  (await loadFeatureStatusLookup())(featureId);
