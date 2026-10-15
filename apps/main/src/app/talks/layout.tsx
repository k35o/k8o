import { Heading } from '@k8ordo/ui';

import { buildPageMetadata } from '@/shared/site/build-page-metadata';

import styles from './layout.module.css';

export const metadata = buildPageMetadata({
  title: 'Talks',
  description: '過去の登壇テーマや資料へのリンクをまとめています。',
  path: '/talks',
});

export default function Layout({ children }: LayoutProps<'/talks'>) {
  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <Heading level="h2">Talks</Heading>
        {children}
      </div>
    </div>
  );
}
