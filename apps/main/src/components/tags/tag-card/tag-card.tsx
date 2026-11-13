import { Card, Separator } from '@k8ordo/ui';
import { ChevronIcon } from '@k8ordo/ui/icons';
import type { FC } from 'react';

import styles from './tag-card.module.css';

export const TagCard: FC<{
  title: string;
  href: string;
  count?: number;
  label: string;
}> = ({ title, href, count, label }) => (
  <Card interactive width="fit">
    <a className={styles.root} href={href}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        {count !== undefined && <span className={styles.count}>{count}</span>}
      </div>
      <Separator />
      <div className={styles.footer}>
        <span className={styles.label}>{label}</span>
        <span className={styles.chevron}>
          <ChevronIcon direction="right" size="sm" />
        </span>
      </div>
    </a>
  </Card>
);
