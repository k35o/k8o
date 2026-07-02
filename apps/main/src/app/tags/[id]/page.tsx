import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getTag, getTags } from '@/features/tags/interface/queries';

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

export default async function Page({ params }: PageProperties) {
  const { id } = await params;
  const tag = await getTag(Number(id));

  if (!tag) {
    notFound();
  }

  return <TagContent {...tag} />;
}
