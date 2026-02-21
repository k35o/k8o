import { cacheLife } from 'next/cache';
import {
  fetchRepositoriesContributions,
  type Repository,
} from '@/services/github/contributions';
import { Presenter } from './presenter';

const USERNAME = 'k35o';
const REPOS: Repository[] = [
  { owner: 'k35o', repo: 'k8o' },
  { owner: 'k35o', repo: 'ArteOdyssey' },
];

export const GitHubContributionGraph = async () => {
  'use cache';
  cacheLife('hours');

  const days = await fetchRepositoriesContributions(USERNAME, REPOS);

  return <Presenter days={days} />;
};
