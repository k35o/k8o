import { cacheLife } from 'next/cache';

import { getTag as _getTag } from '../application/tag';
import { getTags as _getTags } from '../application/tags';

export async function getTags(page = 1) {
  'use cache';
  cacheLife('max');

  const tags = await Promise.resolve(_getTags(page));
  return tags;
}

export async function getTag(id: number) {
  'use cache';
  cacheLife('max');

  const tag = await Promise.resolve(_getTag(id));
  return tag;
}
