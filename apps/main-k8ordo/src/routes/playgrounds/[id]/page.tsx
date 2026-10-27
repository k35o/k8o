import { notFound } from '@k8ordo/framework';
import type { PageProps } from '@k8ordo/framework';

import { loadPlaygroundSection } from '@/components/playgrounds/load-section';
import { PlaygroundSectionView } from '@/components/playgrounds/playground-section/playground-section-view';
import { PageMeta } from '@/components/site/page-meta/page-meta';

export default async function PlaygroundPage({
  params,
}: PageProps<'/playgrounds/:id'>) {
  const { id } = params;
  const section = await loadPlaygroundSection(id);
  if (section === undefined) {
    notFound();
  }

  return (
    <>
      <PageMeta
        description={section.description}
        image={{ path: `/playgrounds/${id}/og.png`, alt: 'Playgrounds' }}
        path={`/playgrounds/${id}`}
        title={section.title}
        titleTemplate={false}
        twitterCard="summary_large_image"
      />
      <PlaygroundSectionView key={id} section={section} />
    </>
  );
}
