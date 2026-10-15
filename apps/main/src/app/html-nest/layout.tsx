import { Heading } from '@k8ordo/ui';

import { buildPageMetadata } from '@/shared/site/build-page-metadata';

import styles from './layout.module.css';

const TITLE = 'HTMLいれ子マップ';
const DESCRIPTION =
  'HTMLタグを選ぶと、親に置ける要素と中に入れられる子要素が浮かび上がります。';

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: '/html-nest',
});

export default function Layout({ children }: LayoutProps<'/html-nest'>) {
  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <Heading level="h2">{TITLE}</Heading>
        {children}
      </div>
    </div>
  );
}
