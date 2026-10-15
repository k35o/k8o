import { Card } from '@k8ordo/ui';
import { cn } from '@repo/helpers/cn';
import type { FC } from 'react';

import styles from './skeleton.module.css';

const CARD_KEYS = ['a', 'b', 'c', 'd', 'e', 'f'] as const;

const PlaygroundCardSkeleton: FC = () => (
  <Card variant="shadow" interactive>
    <div className={styles.card}>
      <div className={cn(styles.bone, styles.title)} />
      <div className={cn(styles.bone, styles.description)} />
      <div className={cn(styles.bone, styles.meta)} />
    </div>
  </Card>
);

export const PlaygroundsListSkeleton: FC = () => (
  <div className={styles.root}>
    <div className={styles.toolbar}>
      <div className={cn(styles.bone, styles.search)} />
      <div className={cn(styles.bone, styles.count)} />
    </div>
    <div className={styles.grid}>
      {CARD_KEYS.map((key) => (
        <PlaygroundCardSkeleton key={key} />
      ))}
    </div>
  </div>
);
