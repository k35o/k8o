import { DB_CONTENT_CACHE_TAG } from '@repo/helpers/cache/main-cache-tags';
import { cacheLife, cacheTag } from 'next/cache';

import { getTalks as _getTalks } from '../application/talks';

export async function getTalks() {
  'use cache';
  cacheLife('max');
  cacheTag(DB_CONTENT_CACHE_TAG);

  const talks = await _getTalks();
  return talks;
}
