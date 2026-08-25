import { cacheLife, cacheTag } from 'next/cache';

import { SLIDES_CACHE_TAG, TAGS_CACHE_TAG } from '@/shared/cache/cache-tags';

import { findSlides } from '../infrastructure/slide-repository';
import type { SlideRecord } from '../infrastructure/slide-repository';

export const getSlides = async (): Promise<SlideRecord[]> => {
  'use cache';
  cacheLife('minutes');
  // タグ名を埋め込むため、タグの変更でも無効化する
  cacheTag(SLIDES_CACHE_TAG, TAGS_CACHE_TAG);

  const result = await findSlides();
  return result;
};

export type { SlideRecord } from '../infrastructure/slide-repository';
