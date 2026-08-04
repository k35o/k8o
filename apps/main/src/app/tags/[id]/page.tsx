import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { JsonLd } from '@/app/_components/json-ld';
import { getTag, getTags } from '@/features/tags/interface/queries';
import { tagBreadcrumbJsonLd } from '@/shared/site/json-ld';

import { TagContent } from '../_components/tag-content';

export async function generateStaticParams() {
  const tags = await getTags();

  return tags.map((tag) => ({
    id: tag.id.toString(),
  }));
}

type PageProperties = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProperties): Promise<Metadata> {
  const { id } = await params;
  const tag = await getTag(Number(id));

  if (!tag) {
    notFound();
  }

  const description = `「${tag.name}」タグに関連するブログやトークをまとめたページです。`;

  return {
    title: tag.name,
    description,
    openGraph: {
      title: tag.name,
      description,
      url: `https://k8o.me/tags/${tag.id.toString()}`,
      siteName: 'k8o',
      locale: 'ja',
      type: 'website',
    },
    twitter: {
      title: tag.name,
      card: 'summary',
      description,
    },
  };
}

async function TagPageContent({ params }: PageProperties) {
  const { id } = await params;
  const tag = await getTag(Number(id));

  if (!tag) {
    notFound();
  }

  return (
    <>
      <JsonLd data={tagBreadcrumbJsonLd(tag)} />
      <TagContent {...tag} />
    </>
  );
}

function TagContentSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-8">
      <div className="bg-bg-base flex items-center gap-4 rounded-xl p-6 shadow-sm">
        <div className="bg-bg-mute size-10 rounded-full" />
        <div className="flex flex-col gap-2">
          <div className="bg-bg-mute h-6 w-32 rounded-md" />
          <div className="bg-bg-mute h-4 w-44 rounded-md" />
        </div>
      </div>
    </div>
  );
}

// params に依存する描画を Suspense 配下へ隔離し、App Shell を URL 非依存に保つ
export default function Page({ params }: PageProperties) {
  return (
    <Suspense fallback={<TagContentSkeleton />}>
      <TagPageContent params={params} />
    </Suspense>
  );
}
