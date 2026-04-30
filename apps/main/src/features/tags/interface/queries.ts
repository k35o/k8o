import { cacheLife } from 'next/cache';
import { getTag as _getTag } from '../application/tag';
import { getTags as _getTags } from '../application/tags';

export async function getTags(page = 1) {
  'use cache';
  cacheLife('max');

  return await _getTags(page);
}

export async function getTag(id: number) {
  'use cache';
  cacheLife('max');

  return await _getTag(id);
}
