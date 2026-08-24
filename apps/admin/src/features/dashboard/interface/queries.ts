import { cacheLife, cacheTag } from 'next/cache';

import {
  BLOGS_CACHE_TAG,
  READING_LIST_CACHE_TAG,
} from '@/shared/cache/cache-tags';

import { fetchDashboardSummary } from '../infrastructure/dashboard-repository';

export const getDashboardSummary = async () => {
  'use cache';
  cacheLife('minutes');
  // ブログ数と記事・ソース数を読むため、両ドメインの変更で無効化する
  cacheTag(BLOGS_CACHE_TAG, READING_LIST_CACHE_TAG);

  const summary = await fetchDashboardSummary();
  return summary;
};
