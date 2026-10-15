import { Heading } from '@k8ordo/ui';

import { buildPageMetadata } from '@/shared/site/build-page-metadata';

import styles from './layout.module.css';

export const metadata = buildPageMetadata({
  title: 'いろばしご',
  description:
    'OKLCHの明度スケールで11段階のカラーパレットを生成し、コントラストを検証します。',
  path: '/palette-maker',
});

export default function Layout({ children }: LayoutProps<'/palette-maker'>) {
  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <Heading level="h2">いろばしご</Heading>
        {children}
      </div>
    </div>
  );
}
