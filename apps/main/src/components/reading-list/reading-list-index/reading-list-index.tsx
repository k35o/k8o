import { Heading, Stack } from '@k8ordo/ui';
import { ListIcon } from '@k8ordo/ui/icons';
import type { FC } from 'react';

import { BrowserOnly } from '@/components/site/browser-only/browser-only';

import { ReadingListLoader } from '../reading-list-loader/reading-list-loader';
import { ReadingListPreload } from '../reading-list-preload/reading-list-preload';
import { ReadingListSkeleton } from '../reading-list-skeleton/reading-list-skeleton';
import { RssLink } from '../rss-link/rss-link';

import styles from './reading-list-index.module.css';

// 一覧の値は api から、絞り込みの値は URL から、どちらもブラウザでしか読めないので、骨組みを置いて
// ブラウザでだけ描く。ListIcon はどのページも読むファイルに載せないよう、サーバーで描いて渡す
export const ReadingListIndex: FC = () => (
  <div className={styles.root}>
    <Stack gap="xl">
      <div className={styles.header}>
        <Heading level="h2">Readings</Heading>
        <RssLink />
      </div>
      <ReadingListPreload />
      <BrowserOnly fallback={<ReadingListSkeleton />}>
        <ReadingListLoader filterIcon={<ListIcon />} />
      </BrowserOnly>
    </Stack>
  </div>
);
