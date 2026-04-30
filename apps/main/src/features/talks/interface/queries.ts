import { cacheLife } from 'next/cache';
import { getTalks as _getTalks } from '../application/talks';

export async function getTalks() {
  'use cache';
  cacheLife('max');

  return await _getTalks();
}
