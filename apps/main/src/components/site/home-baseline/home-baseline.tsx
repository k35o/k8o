'use client';

import { href } from '@k8ordo/framework';
import { Badge } from '@k8ordo/ui';
import { BookTextIcon, ShieldCheckIcon } from '@k8ordo/ui/icons';
import { formatDate } from '@repo/helpers/date/format';
import { use } from 'react';
import type { FC } from 'react';

import { STATUS_META } from '../browser-support-status/status-meta';
import {
  HomePanel,
  HomePanelSkeleton,
  SkeletonLine,
} from '../home-panel/home-panel';
import { loadBaselineChanges } from './baseline-changes-source';
import type { BaselineChange } from './baseline-changes-source';

import styles from './home-baseline.module.css';

const CHANGE_COUNT = 5;

const HEADING = {
  title: 'Baseline の動き',
  icon: <ShieldCheckIcon size="sm" />,
  tone: 'baseline',
} as const;

const Change: FC<{
  change: BaselineChange;
  articleSlug: string | undefined;
}> = ({ change, articleSlug }) => (
  <li className={styles.change}>
    <span className={styles.badge}>
      <Badge
        label={STATUS_META[change.status].label}
        size="sm"
        tone={STATUS_META[change.status].tone}
      />
    </span>
    <span className={styles.featureName}>{change.featureName}</span>
    {articleSlug !== undefined && (
      <a
        className={styles.article}
        href={href('/blog/:slug', { slug: articleSlug })}
      >
        <BookTextIcon size="sm" />
        <span aria-hidden="true">記事</span>
        <span className={styles.srOnly}>{change.featureName}の記事</span>
      </a>
    )}
  </li>
);

export const HomeBaseline: FC<{
  // web-features の機能の ID から、その機能を書いた記事の slug を引く表
  articleSlugs: Record<string, string>;
}> = ({ articleSlugs }) => {
  const changes = use(loadBaselineChanges());
  if (changes === null || changes.length === 0) {
    return null;
  }
  const days = Map.groupBy(changes.slice(0, CHANGE_COUNT), ({ changedAt }) =>
    formatDate(new Date(changedAt), 'yyyy-MM-dd'),
  );
  return (
    <HomePanel
      {...HEADING}
      more={{ href: href('/browser-support'), label: 'Browser Supportを見る' }}
    >
      {[...days].map(([date, dayChanges]) => (
        <div className={styles.day} key={date}>
          <h3 className={styles.date}>
            <time dateTime={date}>
              {formatDate(new Date(`${date}T00:00:00+09:00`), 'M月d日')}
            </time>
          </h3>
          <ul className={styles.changes}>
            {dayChanges.map((change) => (
              <Change
                articleSlug={articleSlugs[change.featureId]}
                change={change}
                key={change.featureId}
              />
            ))}
          </ul>
        </div>
      ))}
    </HomePanel>
  );
};

export const HomeBaselineSkeleton: FC = () => (
  <HomePanelSkeleton {...HEADING}>
    <SkeletonLine width="short" />
    <SkeletonLine width="long" />
    <SkeletonLine width="long" />
    <SkeletonLine width="long" />
    <SkeletonLine width="short" />
    <SkeletonLine width="long" />
    <SkeletonLine width="long" />
  </HomePanelSkeleton>
);
