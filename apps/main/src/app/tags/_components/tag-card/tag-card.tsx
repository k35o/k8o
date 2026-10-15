import { ChevronIcon, Card, Separator } from '@k8ordo/ui';
import type { Route } from 'next';
import Link from 'next/link';
import type { FC } from 'react';

import styles from './tag-card.module.css';

export const TagCard: FC<{
  title: string;
  href: Route;
  count?: number;
  label: string;
  linkLabel: string;
}> = ({ title, href, count, label, linkLabel }) => (
  <Card interactive width="fit">
    <Link aria-label={linkLabel} className={styles.root} href={href}>
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
    </Link>
  </Card>
);
