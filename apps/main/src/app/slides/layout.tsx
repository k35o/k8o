import { Heading } from '@k8ordo/ui';
import Link from 'next/link';

import { buildPageMetadata } from '@/shared/site/build-page-metadata';

import styles from './layout.module.css';

export const metadata = buildPageMetadata({
  title: 'Slides',
  description: '登壇や発表で使ったスライドをまとめています。',
  path: '/slides',
  rssFeedPath: '/slides/feed',
});

export default function Layout({ children }: LayoutProps<'/slides'>) {
  return (
    <div className={styles.root}>
      <div className={styles.stack}>
        <Link className={styles.link} href="/slides">
          <Heading level="h2">Slides</Heading>
        </Link>
        {children}
      </div>
    </div>
  );
}
