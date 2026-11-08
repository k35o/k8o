import type { BaselineFeature } from '@repo/helpers/baseline/model';
import {
  RECENT_CHANGES_LIMIT,
  RECENT_CHANGES_WINDOW_MS,
  selectFeatureStatus,
  selectFeedFeatures,
} from '@repo/helpers/baseline/select';

import {
  findActiveDataset,
  findRecentFeatureChanges,
} from '../infrastructure/browser-support-repository';
import type { BrowserSupportFeatureChange } from '../infrastructure/browser-support-repository';

type BrowserSupportSnapshot = {
  meta: { upstreamVersion: string; ingestedAt: string } | null;
  features: BaselineFeature[];
  recentChanges: BrowserSupportFeatureChange[];
  // CDN に置かれた応答を読む側が「直近1週間」を数える基準。選んだ時刻と同じ値を返す
  nowMs: number;
};

export const getBrowserSupportSnapshot = async (
  nowMs: number,
): Promise<BrowserSupportSnapshot> => {
  const [active, recentChanges] = await Promise.all([
    findActiveDataset(),
    findRecentFeatureChanges(
      new Date(nowMs - RECENT_CHANGES_WINDOW_MS).toISOString(),
      RECENT_CHANGES_LIMIT,
    ),
  ]);
  if (active === null) {
    return { meta: null, features: [], recentChanges, nowMs };
  }
  return {
    meta: {
      upstreamVersion: active.upstreamVersion,
      ingestedAt: active.ingestedAt,
    },
    features: selectFeedFeatures(active.dataset, nowMs),
    recentChanges,
    nowMs,
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
