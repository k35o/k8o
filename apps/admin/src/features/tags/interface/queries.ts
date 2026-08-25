import { cacheLife, cacheTag } from 'next/cache';

import {
  BLOGS_CACHE_TAG,
  SLIDES_CACHE_TAG,
  TAGS_CACHE_TAG,
  TALKS_CACHE_TAG,
} from '@/shared/cache/cache-tags';

import { findTagsWithUsage } from '../infrastructure/tag-repository';
import type { TagWithUsage } from '../infrastructure/tag-repository';

export const getTags = async (): Promise<TagWithUsage[]> => {
  'use cache';
  cacheLife('minutes');
  // 使用数はブログ・トーク・スライドの付与状況を読むため、それらの変更でも無効化する
  cacheTag(TAGS_CACHE_TAG, BLOGS_CACHE_TAG, TALKS_CACHE_TAG, SLIDES_CACHE_TAG);

  const result = await findTagsWithUsage();
  return result;
};

export type { TagWithUsage } from '../infrastructure/tag-repository';
