import { Spinner } from '@k8ordo/ui';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { SpecPreview } from '@/app/_components/spec-preview';
import { ToggleTheme } from '@/app/_components/toggle-theme';
import { getPublicShareForRoute } from '@/features/share/interface/queries';
import type { PublicShare } from '@/features/share/interface/queries';

import { PrintButton } from './_components/print-button';
import { SharedDeck } from './_components/shared-deck';

import styles from './page.module.css';

type SharePageProps = {
  params: Promise<{ slug: string }>;
};

const DESCRIPTIONS = {
  ui: (title) => `k8o AI Studio で作成した UI「${title}」`,
  slides: (title) => `k8o AI Studio で作成したスライド「${title}」`,
} satisfies Record<PublicShare['kind'], (title: string) => string>;

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
    description: DESCRIPTIONS[share.kind](share.title),
  };
};

// 公開共有ページ（認証なし）。スリムなヘッダと、公開した UI かスライドを描く。
// Suspense は params 由来の実行時アクセスのために必要。
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
          {share.kind === 'slides' ? <PrintButton /> : null}
          <ToggleTheme />
          <Link className={styles.homeLink} href="/chat">
            k8o AI Studio
          </Link>
        </div>
      </header>
      <div className={styles.content}>
        {share.kind === 'ui' ? (
          <SpecPreview spec={share.spec} />
        ) : (
          <SharedDeck highlights={share.highlights} source={share.source} />
        )}
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
