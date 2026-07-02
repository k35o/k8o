import { cacheLife, cacheTag } from 'next/cache';

import { DB_CONTENT_CACHE_TAG } from '@/shared/cache/cache-tags';

import { getTalks as _getTalks } from '../application/talks';

export async function getTalks() {
  'use cache';
  cacheLife('max');
  cacheTag(DB_CONTENT_CACHE_TAG);

  const talks = await _getTalks();
  return talks;
}
