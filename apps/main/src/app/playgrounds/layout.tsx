import { buildPageMetadata } from '@/shared/site/build-page-metadata';

import styles from './layout.module.css';

export const metadata = buildPageMetadata({
  title: 'Playgrounds',
  description: 'ブログ記事や興味のある技術の試作品を集めています。',
  path: '/playgrounds',
  twitterCard: 'summary_large_image',
});

export default function PlaygroundsLayout({
  children,
}: LayoutProps<'/playgrounds'>) {
  return <div className={styles.root}>{children}</div>;
}
