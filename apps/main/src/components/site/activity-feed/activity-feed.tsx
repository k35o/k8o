import { Badge } from '@k8ordo/ui';
import {
  BookTextIcon,
  ExternalLinkIcon,
  PackageIcon,
  PresentationIcon,
} from '@k8ordo/ui/icons';
import { formatDate } from '@repo/helpers/date/format';
import type { FC, ReactNode } from 'react';

import type { ActivityItem } from '@/features/activity/interface/queries';

import styles from './activity-feed.module.css';

const KIND: Record<ActivityItem['kind'], { label: string; icon: ReactNode }> = {
  blog: { label: 'Blog', icon: <BookTextIcon size="sm" /> },
  talk: { label: 'Talk', icon: <PresentationIcon size="sm" /> },
  release: { label: 'Release', icon: <PackageIcon size="sm" /> },
};

const titleOf = (item: ActivityItem): string =>
  item.kind === 'release' ? `${item.packageName} ${item.version}` : item.title;

type ActivityFeedProps = {
  // 新しい順
  items: ActivityItem[];
};

const Row: FC<{ item: ActivityItem }> = ({ item }) => {
  const date = new Date(item.date);
  const upcoming = item.kind === 'talk' && item.upcoming;
  const external = item.href.startsWith('https://');
  return (
    <li className={styles.item} data-kind={item.kind} data-upcoming={upcoming}>
      <span aria-hidden="true" className={styles.node}>
        {KIND[item.kind].icon}
      </span>
      <div className={styles.body}>
        <a
          className={styles.link}
          href={item.href}
          {...(external
            ? { rel: 'noopener noreferrer', target: '_blank' }
            : {})}
        >
          {titleOf(item)}
          {external && (
            <span className={styles.external}>
              <ExternalLinkIcon size="sm" />
              <span className={styles.srOnly}>（新しいタブで開く）</span>
            </span>
          )}
        </a>
        <p className={styles.meta}>
          <span className={styles.kind}>{KIND[item.kind].label}</span>
          {upcoming && <Badge label="予定" size="sm" tone="info" />}
          {item.kind === 'talk' && <span>{item.eventName}</span>}
        </p>
      </div>
      <time className={styles.date} dateTime={formatDate(date, 'yyyy-MM-dd')}>
        {formatDate(date, 'M月d日')}
      </time>
    </li>
  );
};

export const ActivityFeed: FC<ActivityFeedProps> = ({ items }) => {
  const months = Map.groupBy(items, (item) =>
    formatDate(new Date(item.date), 'yyyy年M月'),
  );
  return (
    <div className={styles.root}>
      {[...months.entries()].map(([month, rows]) => (
        <section className={styles.group} key={month}>
          <h3 className={styles.month}>
            <span aria-hidden="true" className={styles.monthDot} />
            {month}
          </h3>
          <ul>
            {rows.map((item) => (
              <Row item={item} key={item.id} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
};
