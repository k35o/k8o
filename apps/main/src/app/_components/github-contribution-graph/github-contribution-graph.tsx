import { cacheLife } from 'next/cache';
import { fetchK8oRepositoryContributions } from '@/services/github/contributions';
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

  const weeks = await fetchK8oRepositoryContributions(USERNAME, OWNER, REPO);

  return <Presenter weeks={weeks} />;
};
