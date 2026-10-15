import { Heading } from '@k8ordo/ui';

import { buildPageMetadata } from '@/shared/site/build-page-metadata';

import styles from './layout.module.css';

export const metadata = buildPageMetadata({
  title: 'カラーHexクイズ',
  description: '色からHexコードを当てたり、Hexコードから色を選ぶクイズです。',
  path: '/color-quiz',
});

export default function Layout({ children }: LayoutProps<'/color-quiz'>) {
  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <Heading level="h2">カラーHexクイズ</Heading>
        {children}
      </div>
    </div>
  );
}
