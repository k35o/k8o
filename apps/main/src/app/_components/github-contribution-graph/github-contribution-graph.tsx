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
  let errorMessage: string | undefined;
  try {
    weeks = await fetchK8oRepositoryContributions(USERNAME, OWNER, REPO);
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to fetch k8o repository contributions:', {
      error,
      username: USERNAME,
      owner: OWNER,
      repo: REPO,
    });
    isError = true;
  }

  return (
    <Presenter
      {...(errorMessage ? { errorMessage } : {})}
      isError={isError}
      weeks={weeks}
    />
  );
};
