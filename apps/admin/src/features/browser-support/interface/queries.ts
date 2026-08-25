import type {
  BaselineFeature,
  BaselineSupportStatus,
} from '@repo/helpers/baseline/model';
import { cacheLife, cacheTag } from 'next/cache';

import { BROWSER_SUPPORT_CACHE_TAG } from '@/shared/cache/cache-tags';

import {
  findActiveDataset,
  findRecentSyncRuns,
} from '../infrastructure/browser-support-repository';
import type {
  ActiveDatasetRecord,
  SyncRunRecord,
} from '../infrastructure/browser-support-repository';

// active データセットの共有ローダー。overview と一覧が別々にブロブを読むと、更新を
// 挟んだとき互いに違う世代を表示しうる。キャッシュ境界を一本化して世代を揃える。
// oxlint-disable-next-line eslint/require-await, typescript/require-await -- 'use cache' は async 関数を要求する
async function getActiveDatasetCached(): Promise<ActiveDatasetRecord | null> {
  'use cache';
  cacheLife('minutes');
  cacheTag(BROWSER_SUPPORT_CACHE_TAG);

  return findActiveDataset();
}

export type BrowserSupportOverview = {
  active: {
    upstreamVersion: string;
    ingestedAt: string;
    newlyCount: number;
    widelyCount: number;
    limitedCount: number;
    total: number;
  } | null;
  runs: SyncRunRecord[];
};

export const getBrowserSupportOverview =
  async (): Promise<BrowserSupportOverview> => {
    'use cache';
    cacheLife('minutes');
    cacheTag(BROWSER_SUPPORT_CACHE_TAG);

    const [active, runs] = await Promise.all([
      getActiveDatasetCached(),
      findRecentSyncRuns(10),
    ]);
    if (active === null) {
      return { active: null, runs };
    }

    let newlyCount = 0;
    let widelyCount = 0;
    let limitedCount = 0;
    for (const feature of active.dataset.features) {
      if (feature.status === 'newly') {
        newlyCount += 1;
      } else if (feature.status === 'widely') {
        widelyCount += 1;
      } else {
        limitedCount += 1;
      }
    }

    return {
      active: {
        upstreamVersion: active.upstreamVersion,
        ingestedAt: active.ingestedAt,
        newlyCount,
        widelyCount,
        limitedCount,
        total: active.dataset.features.length,
      },
      runs,
    };
  };

export type FeatureListParams = {
  status?: BaselineSupportStatus | 'all';
  q?: string;
  page?: number;
  pageSize?: number;
};

export type FeatureListResult = {
  items: BaselineFeature[];
  total: number;
};

// active データセット(メモリ上の ~1,200件)に対する絞り込み。検索・ページングは
// アプリ側で行う。ここ自身は 'use cache' しない: パラメータ組み合わせごとにブロブを
// 読み直すキャッシュエントリが増えるだけで、共有ローダーのキャッシュで足りる。
export const getBaselineFeatures = async ({
  status = 'all',
  q,
  page = 1,
  pageSize = 20,
}: FeatureListParams): Promise<FeatureListResult> => {
  const active = await getActiveDatasetCached();
  if (active === null) {
    return { items: [], total: 0 };
  }

  const query = q?.toLowerCase() ?? '';
  const filtered = active.dataset.features.filter((feature) => {
    if (status !== 'all' && feature.status !== status) {
      return false;
    }
    if (
      query !== '' &&
      !feature.name.toLowerCase().includes(query) &&
      !feature.featureId.toLowerCase().includes(query)
    ) {
      return false;
    }
    return true;
  });

  const start = (page - 1) * pageSize;
  return {
    items: filtered.slice(start, start + pageSize),
    total: filtered.length,
  };
};

export type { SyncRunRecord } from '../infrastructure/browser-support-repository';
export type {
  BaselineFeature,
  BaselineSupportStatus,
} from '@repo/helpers/baseline/model';
