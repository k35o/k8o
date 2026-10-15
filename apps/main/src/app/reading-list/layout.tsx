import { Heading } from '@k8ordo/ui';

import { buildPageMetadata } from '@/shared/site/build-page-metadata';

import { RssLink } from './_components/rss-link';

import styles from './layout.module.css';

export const metadata = buildPageMetadata({
  title: 'Readings',
  description: '気になっている記事を集めて、あとから探せるようにしています。',
  path: '/reading-list',
  rssFeedPath: '/reading-list/feed',
});

export default function Layout({ children }: LayoutProps<'/reading-list'>) {
  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <div className={styles.header}>
          <Heading level="h2">Readings</Heading>
          <RssLink />
        </div>
        {children}
      </div>
    </div>
  );
}
