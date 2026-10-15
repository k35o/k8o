import type { FC } from 'react';

import styles from './progress-bar.module.css';

export const ProgressBar: FC<{ current: number; total: number }> = ({
  current,
  total,
}) => {
  const percent = total === 0 ? 0 : ((current + 1) / total) * 100;
  return (
    <div aria-hidden="true" className={styles.root}>
      <div
        className={styles.fill}
        style={{ width: `${percent.toString()}%` }}
      />
    </div>
  );
};
