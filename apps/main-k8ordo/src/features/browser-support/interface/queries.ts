import { selectFeatureStatus } from '@repo/helpers/baseline/select';
import type { InferResponseType } from 'hono/client';

import { findActiveBaselineDataset } from '@/features/browser-support/infrastructure/browser-support-dataset-repository';
import type { publicApi } from '@/shared/api/public-api';
import { memoizeInBuild } from '@/shared/cache/memoize-in-build';

export { getBrowserMinVersions } from '@/features/browser-support/application/min-versions';

type BrowserSupportApi = (typeof publicApi)['public']['browser-support'];

// ビルド時の値はブラウザで api の GET の値に差し替えるので、型を api の応答にそろえ、
// 形がずれたら型検査で止める
export type BrowserSupportFeature = InferResponseType<
  BrowserSupportApi['features'][':featureId']['$get'],
  200
>['feature'];
export type BrowserAvailability = BrowserSupportFeature['support'][number];
export type SupportStatus = BrowserSupportFeature['status'];

// 記事ごとに埋め込んだ機能を解決するたびに DB を読まないよう、データセットを1度だけ読む
const getActiveDataset = memoizeInBuild(findActiveBaselineDataset);

export const getFeatureStatus = async (
  featureId: string,
): Promise<BrowserSupportFeature | null> => {
  const active = await getActiveDataset();
  if (active === null) {
    return null;
  }
  return selectFeatureStatus(active.dataset, featureId);
};
