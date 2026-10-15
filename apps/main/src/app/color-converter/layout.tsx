import { Heading } from '@k8ordo/ui';

import { buildPageMetadata } from '@/shared/site/build-page-metadata';

import styles from './layout.module.css';

export const metadata = buildPageMetadata({
  title: 'カラーコード職人',
  description:
    'HEX・RGB・HSL・HWB・OKLCH・OKLAB・LCH・LABを相互に変換します。どの形式でも貼り付けでき、スライダーで微調整できます。',
  path: '/color-converter',
});

export default function Layout({ children }: LayoutProps<'/color-converter'>) {
  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <Heading level="h2">カラーコード職人</Heading>
        {children}
      </div>
    </div>
  );
}
