import { cacheLife } from 'next/cache';
import { Suspense } from 'react';
import type { ContributionWeek } from '@/services/github/contributions';
import { fetchK8oRepositoryContributions } from '@/services/github/contributions';
import { Presenter } from './presenter';

const USERNAME = 'k35o';
const OWNER = 'k35o';
const REPO = 'k8o';

/**
 * 空のコントリビューションデータを生成（50日分）
 */
const _generateEmptyWeeks = (): ContributionWeek[] => {
  const weeks: ContributionWeek[] = [];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 49);

  let currentWeek: Array<{ date: string; count: number; level: number }> = [];

  for (let i = 0; i <= 49; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    if (dateStr) {
      currentWeek.push({
        date: dateStr,
        count: 0,
        level: 0,
      });
    }

    if (currentWeek.length === 5 || i === 49) {
      weeks.push({ days: [...currentWeek] });
      currentWeek = [];
    }
  }

  return weeks;
};

/**
 * GitHub Contributionグラフコンポーネント（Server Component）
 */
export const GitHubContributionGraph = () => {
  return (
    <Suspense fallback={<Presenter weeks={_generateEmptyWeeks()} />}>
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
