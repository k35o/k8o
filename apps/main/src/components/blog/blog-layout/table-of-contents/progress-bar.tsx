import { useMemo } from 'react';
import type { FC } from 'react';

import { calculateTocPercentage } from '@/shared/mdx/calculate-toc-percentage';
import type { HeadingTree } from '@/shared/mdx/types';

import { END_OF_CONTENT_ID } from '../constants';

import styles from './progress-bar.module.css';

export const ProgressBar: FC<{
  activeId: string;
  headingTree: HeadingTree;
}> = ({ activeId, headingTree }) => {
  const currentPercentage = useMemo(() => {
    if (activeId === END_OF_CONTENT_ID) {
      return 100;
    }
    return calculateTocPercentage(activeId, headingTree);
  }, [activeId, headingTree]);
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - currentPercentage / 100);

  return (
    <div className={styles.root}>
      <span className={styles.srOnly}>読了率 {currentPercentage}%</span>
      <svg aria-hidden="true" className={styles.ring} viewBox="0 0 32 32">
        <circle
          cx="16"
          cy="16"
          fill="none"
          r={radius}
          stroke="var(--color-bg-raised)"
          strokeWidth="3"
        />
        <circle
          className={styles.progress}
          cx="16"
          cy="16"
          fill="none"
          r={radius}
          stroke="var(--color-primary-bg)"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeWidth="3"
        />
      </svg>
      <div aria-hidden="true" className={styles.value}>
        {currentPercentage}
      </div>
    </div>
  );
};
