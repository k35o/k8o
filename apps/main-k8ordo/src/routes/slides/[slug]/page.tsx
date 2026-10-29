import type { PageProps } from '@k8ordo/framework';

import { PageMeta } from '@/components/site/page-meta/page-meta';
import { SlideArticle } from '@/components/slides/slide-article/slide-article';
import { SlidesFrame } from '@/components/slides/slides-frame/slides-frame';
import { getSlideContent } from '@/features/slides/interface/queries';

export default async function SlidePage({
  params,
}: PageProps<'/slides/:slug'>) {
  const { slug } = params;
  const slide = await getSlideContent(slug);

  return (
    <>
      <PageMeta
        article={{ publishedTime: slide.createdAt }}
        description={slide.description}
        image={{ path: `/slides/${slug}/og.png`, alt: slide.title }}
        path={`/slides/${slug}`}
        rssFeedPath="/slides/feed"
        title={slide.title}
        titleTemplate={false}
        twitterCard="summary_large_image"
      />
      <SlidesFrame>
        <SlideArticle key={slug} slug={slug} />
      </SlidesFrame>
    </>
  );
}
