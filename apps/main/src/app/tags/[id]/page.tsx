import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getTag } from '@/services/tags/tag';
import { getTags } from '@/services/tags/tags';
import { TagContent } from '../_components/tag-content';

export async function generateStaticParams() {
  const tags = await getTags();

  return tags.map((tag) => ({
    id: tag.id.toString(),
  }));
}

async function TagContentWrapper({ params }: PageProps<'/tags/[id]'>) {
  const id = (await params).id;
  const tag = await getTag(Number(id));

  if (!tag) {
    notFound();
  }

  return <TagContent {...tag} />;
}

export default function Page(props: PageProps<'/tags/[id]'>) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TagContentWrapper {...props} />
    </Suspense>
  );
}
