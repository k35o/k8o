import { Card } from '@k8ordo/ui';
import { cn } from '@repo/helpers/cn';
import { Suspense } from 'react';

import { getUserContributions } from '@/features/github/interface/queries';

import { Presenter } from './presenter';

import styles from './github-contribution-graph.module.css';

const Skeleton = () => (
  <Card>
    <div className={styles.skeleton}>
      <div className={cn(styles.bone, styles.boneTitle)} />
      <div className={cn(styles.bone, styles.boneGraph)} />
      <div className={cn(styles.bone, styles.boneTotal)} />
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
