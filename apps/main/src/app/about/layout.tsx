import { Heading } from '@k8ordo/ui';
import type { Metadata } from 'next';

import styles from './layout.module.css';

const DESCRIPTION =
  'k8oのプロフィールと、このサイトで公開しているコンテンツの紹介です。';

export const metadata = {
  title: 'About',
  description: DESCRIPTION,
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About',
    description: DESCRIPTION,
    url: 'https://k8o.me/about',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: 'About',
    card: 'summary',
    description: DESCRIPTION,
  },
} satisfies Metadata;

export default function Layout({ children }: LayoutProps<'/about'>) {
  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <Heading level="h2">About</Heading>
        {children}
      </div>
    </div>
  );
}
