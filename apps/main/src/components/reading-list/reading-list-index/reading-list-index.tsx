import { Heading, Stack } from '@k8ordo/ui';
import type { FC } from 'react';

import { BrowserOnly } from '@/components/site/browser-only/browser-only';

import { ReadingListLoader } from '../reading-list-loader/reading-list-loader';
import { ReadingListPreload } from '../reading-list-preload/reading-list-preload';
import { ReadingListSkeleton } from '../reading-list-skeleton/reading-list-skeleton';
import { RssLink } from '../rss-link/rss-link';

import styles from './reading-list-index.module.css';

// 一覧の値は api から、検索の値は URL から、どちらもブラウザでしか読めないので、骨組みを置いて
// ブラウザでだけ描く
export const ReadingListIndex: FC = () => (
  <div className={styles.root}>
    <Stack gap="xl">
      <div className={styles.intro}>
        <div className={styles.header}>
          <Heading level="h2">Readings</Heading>
          <RssLink />
        </div>
        <p className={styles.lead}>
          AIとWebフロントエンドまわりの記事を集めています。
        </p>
      </div>
      <ReadingListPreload />
      <BrowserOnly fallback={<ReadingListSkeleton />}>
        <ReadingListLoader />
      </BrowserOnly>
    </Stack>
  </div>
);
