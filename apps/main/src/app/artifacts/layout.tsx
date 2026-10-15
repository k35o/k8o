import { Heading } from '@k8ordo/ui';

import { buildPageMetadata } from '@/shared/site/build-page-metadata';

import styles from './layout.module.css';

export const metadata = buildPageMetadata({
  title: 'Artifacts',
  description: 'dotfilesやskills、自作ツールなどの制作物をまとめています。',
  path: '/artifacts',
});

export default function Layout({ children }: LayoutProps<'/artifacts'>) {
  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <Heading level="h2">Artifacts</Heading>
        {children}
      </div>
    </div>
  );
}
