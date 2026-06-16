import { Card } from '@k8o/arte-odyssey';
import { Suspense } from 'react';

import { getUserContributions } from '@/features/github/interface/queries';

import { Presenter } from './presenter';

// Presenter のカード構造（ヘッダ / h-48 のチャート / フッタ）に合わせた骨組み。
// 取得が遅い GitHub API を待つ間にページ全体の描画をブロックしないための fallback。
const Skeleton = () => (
  <Card>
    <div className="flex flex-col gap-4 p-6">
      <div className="bg-bg-mute h-5 w-32 animate-pulse rounded" />
      <div className="bg-bg-mute h-48 animate-pulse rounded" />
      <div className="bg-bg-mute h-4 w-24 animate-pulse rounded" />
    </div>
  </Card>
);

const GitHubContributionGraphContent = async () => {
  const days = await getUserContributions();

  return <Presenter days={days} />;
};

export const GitHubContributionGraph = () => (
  <Suspense fallback={<Skeleton />}>
    <GitHubContributionGraphContent />
  </Suspense>
);
