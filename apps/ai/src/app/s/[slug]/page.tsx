import { Spinner } from '@k8ordo/ui';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { SpecPreview } from '@/app/_components/spec-preview';
import { ToggleTheme } from '@/app/_components/toggle-theme';
import { getPublicShareForRoute } from '@/features/share/interface/queries';

import styles from './page.module.css';

type SharePageProps = {
  params: Promise<{ slug: string }>;
};

export const generateMetadata = async ({
  params,
}: SharePageProps): Promise<Metadata> => {
  const { slug } = await params;
  const share = await getPublicShareForRoute(slug);
  if (share === null) {
    return { title: '見つかりません | k8o AI Studio' };
  }
  return {
    title: `${share.title} | k8o AI Studio`,
    description: `k8o AI Studio で作成した UI「${share.title}」`,
  };
};

// 公開共有ページ（認証なし）。スリムなヘッダ＋spec をその場で描画する。
// 取得は 'use cache'（share:<slug> タグ、publish/unpublish が updateTag）で
// キャッシュ済み。Suspense は params 由来の実行時アクセスのために必要。
const ShareContent = async ({ params }: SharePageProps) => {
  const { slug } = await params;
  const share = await getPublicShareForRoute(slug);
  if (share === null) {
    notFound();
  }
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.titles}>
          <span className={styles.title}>{share.title}</span>
          <span className={styles.caption}>k8o AI Studio で作成</span>
        </div>
        <div className={styles.actions}>
          <ToggleTheme />
          <Link className={styles.homeLink} href="/">
            k8o AI Studio
          </Link>
        </div>
      </header>
      <div className={styles.content}>
        <SpecPreview spec={share.spec} />
      </div>
    </div>
  );
};

export default function SharePage({ params }: SharePageProps) {
  return (
    <Suspense
      fallback={
        <div className={styles.fallback}>
          <Spinner label="読み込み中" size="lg" />
        </div>
      }
    >
      <ShareContent params={params} />
    </Suspense>
  );
}
