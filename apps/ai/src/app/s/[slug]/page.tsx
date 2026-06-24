import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getPublicShareForRoute } from '@/features/share/interface/queries';

import { SharePreview } from './_components/share-preview';

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

// 公開共有ページ（認証なし）。スリムなヘッダ＋隔離した iframe で本物ビルドを描画する。
export default async function SharePage({ params }: SharePageProps) {
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
        <Link
          className="text-fg-base shrink-0 text-sm font-medium hover:underline"
          href="/"
        >
          k8o AI Studio
        </Link>
      </header>
      <div className="min-h-0 flex-1">
        <SharePreview slug={slug} title={share.title} />
      </div>
    </div>
  );
}
