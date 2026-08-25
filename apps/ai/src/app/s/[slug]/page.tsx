import { Spinner } from '@k8o/arte-odyssey';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { SpecPreview } from '@/app/_components/spec-preview';
import { ToggleTheme } from '@/app/_components/toggle-theme';
import { getPublicShareForRoute } from '@/features/share/interface/queries';

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
    <div className="bg-bg-surface flex h-dvh flex-col">
      <header className="border-border-mute flex items-center justify-between gap-4 border-b px-6 py-3">
        <div className="flex min-w-0 flex-col">
          <span className="text-fg-base truncate text-sm font-bold">
            {share.title}
          </span>
          <span className="text-fg-mute text-xs">k8o AI Studio で作成</span>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <ToggleTheme />
          <Link
            className="text-fg-base text-sm font-medium hover:underline"
            href="/"
          >
            k8o AI Studio
          </Link>
        </div>
      </header>
      <div className="min-h-0 flex-1">
        <SpecPreview spec={share.spec} />
      </div>
    </div>
  );
};

export default function SharePage({ params }: SharePageProps) {
  return (
    <Suspense
      fallback={
        <div className="bg-bg-surface flex h-dvh items-center justify-center">
          <Spinner label="読み込み中" size="lg" />
        </div>
      }
    >
      <ShareContent params={params} />
    </Suspense>
  );
}
