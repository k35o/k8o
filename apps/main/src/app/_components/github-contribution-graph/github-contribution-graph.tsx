import { cacheLife } from 'next/cache';
import { Suspense } from 'react';
import type { ContributionWeek } from '@/services/github/contributions';
import { fetchK8oRepositoryContributions } from '@/services/github/contributions';
import { Presenter } from './presenter';

const USERNAME = 'k35o';
const OWNER = 'k35o';
const REPO = 'k8o';

/**
 * 空のコントリビューションデータ（10週間分の空データ）
 * プリレンダリング時にnew Date()を使用しないよう、静的な空配列を使用
 */
const EMPTY_WEEKS: ContributionWeek[] = Array.from({ length: 10 }, () => ({
  days: Array.from({ length: 5 }, () => ({
    date: '2000-01-01',
    count: 0,
    level: 0,
  })),
}));

/**
 * GitHub Contributionグラフコンポーネント（Server Component）
 */
export const GitHubContributionGraph = () => {
  return (
    <Suspense fallback={<Presenter weeks={EMPTY_WEEKS} />}>
      <RepositoryContributionsContent />
    </Suspense>
  );
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
