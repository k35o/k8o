import { range } from '@repo/helpers/array/range';
import { cn } from '@repo/helpers/cn';
import type { FC } from 'react';

import { ToolHeader } from '../../../_components/tool-frame';

import styles from './artifact-skeleton.module.css';

export const ArtifactSkeleton: FC = () => (
  <>
    <ToolHeader>
      <div className={cn(styles.bone, styles.title)} data-skeleton />
      <div className={cn(styles.bone, styles.badge)} data-skeleton />
      <div className={cn(styles.bone, styles.action)} data-skeleton />
    </ToolHeader>
    <div
      aria-busy
      aria-label="読み込み中"
      className={styles.root}
      role="status"
    >
      <div className={styles.tabs}>
        <div className={cn(styles.bone, styles.tab)} data-skeleton />
      </div>
      <div className={styles.body}>
        <div className={styles.main}>
          <div className={cn(styles.bone, styles.preview)} data-skeleton />
        </div>
        <div className={styles.history}>
          {range(0, 3).map((n) => (
            <div
              className={cn(styles.bone, styles.version)}
              data-skeleton
              key={`artifact-version-skeleton-${n}`}
            />
          ))}
        </div>
      </div>
    </div>
  </>
);
