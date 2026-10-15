import { range } from '@repo/helpers/array/range';
import type { FC } from 'react';

import styles from './sidebar-list-skeleton.module.css';

export const SidebarListSkeleton: FC = () => (
  <div aria-busy aria-label="読み込み中" className={styles.root}>
    {range(0, 4).map((n) => (
      <div className={styles.item} key={`sidebar-list-skeleton-${n}`} />
    ))}
  </div>
);
