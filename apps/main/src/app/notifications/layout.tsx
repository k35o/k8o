import { Heading } from '@k8ordo/ui';

import { buildPageMetadata } from '@/shared/site/build-page-metadata';

import styles from './layout.module.css';

const description =
  'ReadingsとBrowser Supportの更新をプッシュ通知で受け取れます。受け取った通知の履歴も確認できます。';

export const metadata = buildPageMetadata({
  title: '通知',
  description,
  path: '/notifications',
});

export default function Layout({ children }: LayoutProps<'/notifications'>) {
  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <Heading level="h2">通知</Heading>
        {children}
      </div>
    </div>
  );
}
