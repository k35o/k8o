import { notFound } from 'next/navigation';
import { getTag as _getTag } from '@/services/tags/tag';
import { getTags as _getTags } from '@/services/tags/tags';
import { TagContent } from '../_components/tag-content';

async function getTags() {
  'use cache';

  return await _getTags();
}

async function getTag(id: number) {
  'use cache';

  return await _getTag(id);
}

export async function generateStaticParams() {
  const tags = await getTags();

  return tags.map((tag) => ({
    id: tag.id.toString(),
  }));
}

export default async function Page({ params }: PageProps<'/tags/[id]'>) {
  const id = (await params).id;
  const tag = await getTag(Number(id));

  if (!tag) {
    notFound();
  }

  return <TagContent {...tag} />;
}
