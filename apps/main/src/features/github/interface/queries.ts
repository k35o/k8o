import { cacheLife } from 'next/cache';

import { fetchUserContributions } from '../infrastructure/contributions';

export type ContributionDay = Awaited<
  ReturnType<typeof fetchUserContributions>
>[number];

const USERNAME = 'k35o';

export async function getUserContributions() {
  'use cache';
  cacheLife('minutes');

  const days = await fetchUserContributions(USERNAME);
  return days;
}
