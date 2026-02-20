import { cacheLife } from 'next/cache';
import {
  type ContributionDay,
  fetchK8oRepositoryContributions,
} from '@/services/github/contributions';
import { Presenter } from './presenter';

const USERNAME = 'k35o';
const OWNER = 'k35o';
const REPO = 'k8o';

export const GitHubContributionGraph = async () => {
  'use cache';
  cacheLife('hours');

  const days: ContributionDay[] = await fetchK8oRepositoryContributions(
    USERNAME,
    OWNER,
    REPO,
  );

  return <Presenter days={days} />;
};
