import { Heading } from '@k8ordo/ui';

import { buildPageMetadata } from '@/shared/site/build-page-metadata';

import styles from './layout.module.css';

export const metadata = buildPageMetadata({
  title: 'もじカウント',
  description: 'テキストの文字数をリアルタイムに数えます。',
  path: '/moji-count',
});

export default function Layout({ children }: LayoutProps<'/moji-count'>) {
  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <Heading level="h2">もじカウント</Heading>
        {children}
      </div>
    </div>
  );
}
