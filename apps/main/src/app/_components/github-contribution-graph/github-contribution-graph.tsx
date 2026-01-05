import { cacheLife } from 'next/cache';
import { Suspense } from 'react';
import { fetchGitHubContributions } from '@/services/github/contributions';
import { GitHubContributionGraphClient } from './github-contribution-graph-client';
import { GitHubContributionGraphSkeleton } from './github-contribution-graph-skeleton';

type GitHubContributionGraphProps = {
  username?: string;
};

/**
 * GitHub Contributionグラフコンポーネント（Server Component）
 */
export const GitHubContributionGraph = ({
  username = 'k35o',
}: GitHubContributionGraphProps) => {
  return (
    <Suspense fallback={<GitHubContributionGraphSkeleton />}>
      <GitHubContributionGraphContent username={username} />
    </Suspense>
  );
};

/**
 * データ取得を行う内部コンポーネント
 */
const GitHubContributionGraphContent = async ({
  username,
}: {
  username: string;
}) => {
  'use cache';
  cacheLife('hours');

  const weeks = await fetchGitHubContributions(username);

  return <GitHubContributionGraphClient weeks={weeks} />;
};
