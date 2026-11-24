import { range } from '@repo/helpers/array/range';
import type { FC } from 'react';

import styles from './reading-list-skeleton.module.css';

export const ReadingListSkeleton: FC = () => (
  <div className={styles.root}>
    <div className={styles.toolbar}>
      <div className={styles.search} />
      <div className={styles.count} />
    </div>
    {range(0, 3).map((day) => (
      <div className={styles.day} key={`day-skeleton-${day}`}>
        <div className={styles.date} />
        <div className={styles.line} />
        <div className={styles.shortLine} />
        {range(0, 3).map((topic) => (
          <div className={styles.topic} key={`topic-skeleton-${topic}`} />
        ))}
      </div>
    ))}
  </div>
);
