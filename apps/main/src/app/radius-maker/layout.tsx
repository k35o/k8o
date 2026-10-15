import { Heading } from '@k8ordo/ui';

import { buildPageMetadata } from '@/shared/site/build-page-metadata';

import styles from './layout.module.css';

export const metadata = buildPageMetadata({
  title: 'かどまるラボ',
  description: 'border-radiusを視覚的に操作してCSSを生成します。',
  path: '/radius-maker',
});

export default function Layout({ children }: LayoutProps<'/radius-maker'>) {
  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <Heading level="h2">かどまるラボ</Heading>
        {children}
      </div>
    </div>
  );
}
