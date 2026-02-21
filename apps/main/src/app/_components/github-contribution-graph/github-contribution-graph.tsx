import { cacheLife } from 'next/cache';
import {
  type ContributionDay,
  fetchRepositoryCommitContributions,
} from '@/services/github/contributions';
import { Presenter } from './presenter';

const USERNAME = 'k35o';
const OWNER = 'k35o';

function mergeContributions(results: ContributionDay[][]): ContributionDay[] {
  const mergedMap = new Map<string, ContributionDay>();
  for (const days of results) {
    for (const day of days) {
      const existing = mergedMap.get(day.date);
      mergedMap.set(day.date, {
        ...day,
        count: (existing?.count ?? 0) + day.count,
      });
    }
  }

  return Array.from(mergedMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
}

export const GitHubContributionGraph = async () => {
  'use cache';
  cacheLife('hours');

  const results = await Promise.all([
    fetchRepositoryCommitContributions(USERNAME, OWNER, 'k8o'),
    fetchRepositoryCommitContributions(USERNAME, OWNER, 'ArteOdyssey'),
  ]);

  const days = mergeContributions(results);

  return <Presenter days={days} />;
};
