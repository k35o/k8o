import { notFound } from 'next/navigation';
import { getTag, getTags } from '@/features/tags/interface/queries';
import { TagContent } from '../_components/tag-content';

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
