import {
  RECENT_CHANGES_LIMIT,
  RECENT_CHANGES_WINDOW_MS,
  selectFeatureStatus,
  selectFeedFeatures,
} from '@repo/helpers/baseline/select';
import type { BrowserMinVersions } from '@repo/helpers/browser/detect-browser';
import type { InferResponseType } from 'hono/client';
import { cacheLife } from 'next/cache';

import { getBrowserMinVersions as _getBrowserMinVersions } from '@/features/browser-support/application/min-versions';
import { findRecentFeatureChanges } from '@/features/browser-support/infrastructure/browser-support-change-repository';
import { findActiveBaselineDataset } from '@/features/browser-support/infrastructure/browser-support-dataset-repository';
import type { ActiveBaselineDataset } from '@/features/browser-support/infrastructure/browser-support-dataset-repository';
import type { publicApi } from '@/shared/api/public-api';

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

// active データセットの共有ローダー。フィードと MDX の feature 解決が個別に DB を
// 読まないよう、キャッシュ境界をここに一本化する
async function getActiveDataset(): Promise<ActiveBaselineDataset | null> {
  'use cache';
  cacheLife('max');

  return findActiveBaselineDataset();
}

export async function getBrowserSupportSnapshot(): Promise<BrowserSupportSnapshot> {
  'use cache';
  cacheLife('max');

  // 「直近1週間」フィルタと limited の直近1年カットオフの基準時刻。component render では
  // Date.now() を呼べないため、キャッシュ境界内で解決して一緒に返す
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
}

export async function getFeatureStatus(
  featureId: string,
): Promise<BrowserSupportFeature | null> {
  const active = await getActiveDataset();
  if (active === null) {
    return null;
  }
  return selectFeatureStatus(active.dataset, featureId);
}

// フロアはコミット済み生成物(実行時 I/O ゼロ)。RootLayout が全ページの静的シェルで
// 読むため、DB やキャッシュに依存させない。
export function getBrowserMinVersions(): BrowserMinVersions {
  return _getBrowserMinVersions();
}
