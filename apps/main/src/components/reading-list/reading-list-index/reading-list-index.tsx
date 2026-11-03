import { Heading, ListIcon } from '@k8ordo/ui';
import type { FC } from 'react';

import { BrowserOnly } from '@/components/site/browser-only/browser-only';
import type { ReadingList } from '@/features/reading-list/interface/queries';

import { ReadingListContent } from '../reading-list-content/reading-list-content';
import { ReadingListSkeleton } from '../reading-list-skeleton/reading-list-skeleton';
import { RssLink } from '../rss-link/rss-link';

import styles from './reading-list-index.module.css';

// HTML は URL の値を知らずに描くので、一覧は骨組みを置いてブラウザでだけ描く。既定の値で描くと、
// URL の値で開いたときに全件が一度出る。ListIcon はどのページも読むファイルに載せないよう、
// サーバーで描いて渡す
export const ReadingListIndex: FC<{ readingList: ReadingList }> = ({
  readingList,
}) => (
  <div className={styles.root}>
    <div className={styles.content}>
      <div className={styles.header}>
        <Heading level="h2">Readings</Heading>
        <RssLink />
      </div>
      <BrowserOnly fallback={<ReadingListSkeleton />}>
        <ReadingListContent
          filterIcon={<ListIcon />}
          readingList={readingList}
        />
      </BrowserOnly>
    </div>
  </div>
);
