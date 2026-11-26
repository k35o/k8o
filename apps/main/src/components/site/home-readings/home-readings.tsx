'use client';

import { href } from '@k8ordo/framework';
import { ExternalLinkIcon, ListIcon } from '@k8ordo/ui/icons';
import { formatDate } from '@repo/helpers/date/format';
import { isHttpUrl } from '@repo/helpers/url/is-http-url';
import { use } from 'react';
import type { FC } from 'react';

import {
  HomePanel,
  HomePanelSkeleton,
  SkeletonLine,
} from '../home-panel/home-panel';
import { loadLatestReadingDay } from './latest-reading-source';
import type { ReadingDay } from './latest-reading-source';

import styles from './home-readings.module.css';

const HEADING = {
  title: 'Readings',
  icon: <ListIcon size="sm" />,
  tone: 'readings',
} as const;

const Pick: FC<{ article: ReadingDay['picks'][number]['article'] }> = ({
  article,
}) => (
  <li className={styles.pick}>
    {isHttpUrl(article.url) ? (
      <a
        className={styles.pickTitle}
        href={article.url}
        rel="noopener noreferrer"
        target="_blank"
      >
        {article.title}
        <span className={styles.external}>
          <ExternalLinkIcon size="sm" />
          <span className={styles.srOnly}>（新しいタブで開く）</span>
        </span>
      </a>
    ) : (
      <p className={styles.pickTitle}>{article.title}</p>
    )}
    <p className={styles.source}>{article.sourceTitle}</p>
  </li>
);

export const HomeReadings: FC = () => {
  const day = use(loadLatestReadingDay());
  if (day === null) {
    return null;
  }
  return (
    <HomePanel
      {...HEADING}
      meta={
        <p className={styles.meta}>
          <time dateTime={day.date}>
            {formatDate(new Date(`${day.date}T00:00:00+09:00`), 'M月d日(E)')}
          </time>
          ・{day.articleCount}件
        </p>
      }
      more={{
        href: `${href('/reading-list')}#${day.date}`,
        label: 'この日のReadingsを見る',
      }}
    >
      {day.overview !== null && (
        <p className={styles.overview}>{day.overview}</p>
      )}
      {day.picks.length > 0 && (
        <div className={styles.picks}>
          <h3 className={styles.label}>見てほしい</h3>
          <ul className={styles.pickList}>
            {day.picks.map(({ article }) => (
              <Pick article={article} key={article.id} />
            ))}
          </ul>
        </div>
      )}
    </HomePanel>
  );
};

export const HomeReadingsSkeleton: FC = () => (
  <HomePanelSkeleton {...HEADING}>
    <SkeletonLine width="full" />
    <SkeletonLine width="full" />
    <SkeletonLine width="long" />
    <SkeletonLine width="short" />
    <SkeletonLine width="full" />
    <SkeletonLine width="long" />
    <SkeletonLine width="full" />
    <SkeletonLine width="long" />
  </HomePanelSkeleton>
);
