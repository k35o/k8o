import { Heading } from '@k8ordo/ui';

import { buildPageMetadata } from '@/shared/site/build-page-metadata';

import styles from './layout.module.css';

export const metadata = buildPageMetadata({
  title: 'コントラストチェッカー',
  description:
    '2色のコントラスト比とAPCAのLc値を計算し、WCAGの基準で評価します。',
  path: '/contrast-checker',
});

export default function Layout({ children }: LayoutProps<'/contrast-checker'>) {
  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <Heading level="h2">コントラストチェッカー</Heading>
        {children}
      </div>
    </div>
  );
}
