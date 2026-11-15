import {
  getBrowserSupportSnapshot as readBrowserSupportSnapshot,
  loadFeatureStatusLookup,
} from '@repo/api/build-data';
import type { InferResponseType } from 'hono/client';

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

export const getBrowserSupportSnapshot =
  async (): Promise<BrowserSupportSnapshot> =>
    readBrowserSupportSnapshot(Date.now());

const getFeatureStatusLookup = memoizeInBuild(loadFeatureStatusLookup);

export const getFeatureStatus = async (
  featureId: string,
): Promise<BrowserSupportFeature | null> =>
  (await getFeatureStatusLookup())(featureId);
