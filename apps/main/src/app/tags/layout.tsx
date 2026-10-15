import { Heading, TagIcon } from '@k8ordo/ui';
import Link from 'next/link';

import { buildPageMetadata } from '@/shared/site/build-page-metadata';

import styles from './layout.module.css';

export const metadata = buildPageMetadata({
  title: 'Tags',
  description:
    'k8oで提供するサービスやブログのタグ一覧をまとめたページです。各タグの関連するコンテンツへのリンクを掲載しています。',
  path: '/tags',
});

export default function Layout({ children }: LayoutProps<'/tags'>) {
  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <div className={styles.header}>
          <Link href="/tags">
            <Heading level="h2">
              <span className={styles.title}>
                <span className={styles.titleIcon}>
                  <TagIcon />
                </span>
                タグ置き場
              </span>
            </Heading>
          </Link>
          <p>
            k8oで提供するサービスやブログのタグをまとめました。各タグを利用するコンテンツを確認できます。
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
