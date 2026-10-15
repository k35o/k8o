import { Card } from '@k8ordo/ui';
import type { FC } from 'react';

import styles from './skeleton.module.css';

export const ReadingCardSkeleton: FC = () => (
  <div className={styles.root}>
    <Card interactive variant="shadow">
      <div className={styles.card}>
        <div className={styles.image}>
          <div className={styles.imageFrame} />
        </div>
        <div className={styles.body}>
          <div className={styles.title} />
          <div className={styles.text} />
          <div className={styles.meta} />
        </div>
      </div>
    </Card>
  </div>
);
