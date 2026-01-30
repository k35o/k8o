import { cacheLife } from 'next/cache';
import {
  type ContributionWeek,
  fetchK8oRepositoryContributions,
} from '@/services/github/contributions';
import { Presenter } from './presenter';

const USERNAME = 'k35o';
const OWNER = 'k35o';
const REPO = 'k8o';

/**
 * GitHub Contributionグラフコンポーネント（Server Component）
 */
export const GitHubContributionGraph = () => {
  return <RepositoryContributionsContent />;
};

/**
 * k8oリポジトリのコントリビューションデータ取得コンポーネント
 */
const RepositoryContributionsContent = async () => {
  'use cache';
  cacheLife('hours');

  let weeks: ContributionWeek[] = [];
  let isError = false;
  try {
    weeks = await fetchK8oRepositoryContributions(USERNAME, OWNER, REPO);
  } catch (error) {
    console.error('Failed to fetch k8o repository contributions:', error);
    isError = true;
  }

  return <Presenter isError={isError} weeks={weeks} />;
};
