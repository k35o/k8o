import { cn } from '@repo/helpers/cn';
import type { FC } from 'react';

import styles from './progress-bar.module.css';

export const ProgressBar: FC<{ current: number; total: number }> = ({
  current,
  total,
}) => {
  const percent = total === 0 ? 0 : ((current + 1) / total) * 100;
  return (
    <div aria-hidden="true" className={cn(styles['track'], 'bg-bg-mute')}>
      <div
        className={cn(styles['fill'], 'bg-primary-border')}
        style={{ width: `${percent.toString()}%` }}
      />
    </div>
  );
};
