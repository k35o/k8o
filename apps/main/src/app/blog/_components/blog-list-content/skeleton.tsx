import { Card } from '@k8ordo/ui';
import { cn } from '@repo/helpers/cn';
import type { FC } from 'react';

import styles from './skeleton.module.css';

const CARD_KEYS = ['a', 'b', 'c', 'd', 'e'] as const;

const BlogCardSkeleton: FC = () => (
  <Card interactive>
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <div className={cn(styles.bone, styles.title)} />
        <div className={cn(styles.bone, styles.description)} />
      </div>
      <div className={styles.cardFoot}>
        <div className={cn(styles.bone, styles.tags)} />
        <div className={cn(styles.bone, styles.date)} />
      </div>
    </div>
  </Card>
);

export const BlogListSkeleton: FC = () => (
  <div className={styles.root}>
    <div className={styles.toolbar}>
      <div className={cn(styles.bone, styles.search)} />
      <div className={cn(styles.bone, styles.count)} />
    </div>
    <div className={styles.list}>
      {CARD_KEYS.map((key) => (
        <BlogCardSkeleton key={key} />
      ))}
    </div>
  </div>
);
