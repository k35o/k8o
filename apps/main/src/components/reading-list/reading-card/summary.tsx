import { Badge } from '@k8ordo/ui';
import type { FC } from 'react';

import styles from './summary.module.css';

export const ReadingCardSummary: FC<{ summary: string }> = ({ summary }) => (
  <div className={styles.root}>
    <span className={styles.badge}>
      <Badge size="sm" label="AI要約" tone="info" />
    </span>
    <p className={styles.text}>{summary}</p>
  </div>
);
