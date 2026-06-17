import { Card } from '@k8o/arte-odyssey';
import { Suspense } from 'react';

import { getUserContributions } from '@/features/github/interface/queries';

import { Presenter } from './presenter';

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
