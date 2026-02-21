import { cacheLife } from 'next/cache';
import {
  type ContributionDay,
  fetchK8oRepositoryContributions,
} from '@/services/github/contributions';
import { Presenter } from './presenter';

const USERNAME = 'k35o';
const OWNER = 'k35o';

function mergeContributions(results: ContributionDay[][]): ContributionDay[] {
  const mergedMap = new Map<string, number>();
  for (const days of results) {
    for (const day of days) {
      mergedMap.set(day.date, (mergedMap.get(day.date) || 0) + day.count);
    }
  }

  return Array.from(mergedMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}

export const GitHubContributionGraph = async () => {
  'use cache';
  cacheLife('hours');

  const results = await Promise.all([
    fetchK8oRepositoryContributions(USERNAME, OWNER, 'k8o'),
    fetchK8oRepositoryContributions(USERNAME, OWNER, 'ArteOdyssey'),
  ]);

  const days = mergeContributions(results);

  return <Presenter days={days} />;
};
