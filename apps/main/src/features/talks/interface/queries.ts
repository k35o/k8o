import { cacheLife } from 'next/cache';

import { getTalks as _getTalks } from '../application/talks';

export async function getTalks() {
  'use cache';
  cacheLife('max');

  const talks = await Promise.resolve(_getTalks());
  return talks;
}
