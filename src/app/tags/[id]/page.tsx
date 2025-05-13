import { TagContent } from '../_components/tag-content';
import { getTag, getTags } from '@/services/tags';
import { unstable_cache as cache } from 'next/cache';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const tags = await cache(getTags)();

  return tags.map((tag) => ({
    id: tag.id.toString(),
  }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const tag = await cache((id: number) => getTag(id))(Number(id));

  if (!tag) {
    notFound();
  }

  return <TagContent {...tag} />;
}
