import {
  RECENT_CHANGES_LIMIT,
  RECENT_CHANGES_WINDOW_MS,
  selectFeatureStatus,
  selectFeedFeatures,
} from '@repo/helpers/baseline/select';
import type { InferResponseType } from 'hono/client';

import { findRecentFeatureChanges } from '@/features/browser-support/infrastructure/browser-support-change-repository';
import { findActiveBaselineDataset } from '@/features/browser-support/infrastructure/browser-support-dataset-repository';
import type { publicApi } from '@/shared/api/public-api';
import { memoizeInBuild } from '@/shared/cache/memoize-in-build';

export { getBrowserMinVersions } from '@/features/browser-support/application/min-versions';

type BrowserSupportApi = (typeof publicApi)['public']['browser-support'];

// ビルド時の値はブラウザで api の GET の値に差し替えるので、型を api の応答にそろえ、
// 形がずれたら型検査で止める
export type BrowserSupportSnapshot = InferResponseType<
  BrowserSupportApi['$get'],
  200
>;
export type BrowserSupportFeature = InferResponseType<
  BrowserSupportApi['features'][':featureId']['$get'],
  200
>['feature'];
export type BrowserSupportFeatureChange =
  BrowserSupportSnapshot['recentChanges'][number];
export type BrowserAvailability = BrowserSupportFeature['support'][number];
export type SupportStatus = BrowserSupportFeature['status'];

// 記事ごとに埋め込んだ機能を解決するたびに DB を読まないよう、データセットを1度だけ読む
const getActiveDataset = memoizeInBuild(findActiveBaselineDataset);

// 「直近1週間」と limited の直近1年の基準の時刻も覚え、HTML とペイロードの2回の描画で
// 同じ値にする
export const getBrowserSupportSnapshot = memoizeInBuild(
  async (): Promise<BrowserSupportSnapshot> => {
    const nowMs = Date.now();
    const [active, recentChanges] = await Promise.all([
      getActiveDataset(),
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
  },
);

export const getFeatureStatus = async (
  featureId: string,
): Promise<BrowserSupportFeature | null> => {
  const active = await getActiveDataset();
  if (active === null) {
    return null;
  }
  return selectFeatureStatus(active.dataset, featureId);
};
