import { DB_CONTENT_CACHE_TAG } from '@repo/helpers/cache/main-cache-tags';
import { cacheLife, cacheTag } from 'next/cache';

import { getTag as _getTag } from '../application/tag';
import { getTags as _getTags } from '../application/tags';

export async function getTags() {
  'use cache';
  cacheLife('max');
  cacheTag(DB_CONTENT_CACHE_TAG);

  const tags = await _getTags();
  return tags;
}

export async function getTag(id: number) {
  'use cache';
  cacheLife('max');
  cacheTag(DB_CONTENT_CACHE_TAG);

  const tag = await _getTag(id);
  return tag;
}
