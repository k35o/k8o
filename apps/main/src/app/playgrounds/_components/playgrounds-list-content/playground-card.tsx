import { BlogIcon, Card, ChevronIcon, Heading } from '@k8ordo/ui';
import type { Route } from 'next';
import Link from 'next/link';
import type { FC } from 'react';

import type { PlaygroundSummary } from '../../_utils/types';

import styles from './playground-card.module.css';

export const PlaygroundCard: FC<{
  playground: PlaygroundSummary;
  headingType?: 'h3' | 'h4';
}> = ({ playground, headingType = 'h3' }) => (
  <Card variant="shadow" interactive>
    <Link
      className={styles.root}
      href={`/playgrounds/${playground.id}` as Route}
    >
      <div className={styles.body}>
        <Heading lineClamp={2} level={headingType}>
          {playground.title}
        </Heading>
        <p className={styles.description}>{playground.description}</p>
        <div className={styles.meta}>
          <span>デモ{playground.demoCount}件</span>
          {playground.hasBlog && (
            <span className={styles.blog}>
              <BlogIcon size="sm" />
              ブログ記事
            </span>
          )}
          <span className={styles.chevron}>
            <ChevronIcon direction="right" size="sm" />
          </span>
        </div>
      </div>
    </Link>
  </Card>
);
