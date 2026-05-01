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

export default async function Page({ params }: PageProperties) {
  const { id } = await params;
  const tag = await getTag(Number(id));

  if (!tag) {
    notFound();
  }

  return <TagContent {...tag} />;
}
