import { PageMeta } from '@/components/site/page-meta/page-meta';
import { SlideIndex } from '@/components/slides/slide-index/slide-index';
import { SlidesFrame } from '@/components/slides/slides-frame/slides-frame';
import { getSlideContents } from '@/features/slides/interface/queries';

export default async function SlidesPage() {
  const slides = await getSlideContents();

  return (
    <>
      <PageMeta
        description="登壇や発表で使ったスライドをまとめています。"
        image={{ path: '/slides/og.png', alt: 'slides' }}
        path="/slides"
        rssFeedPath="/slides/feed"
        title="Slides"
      />
      <SlidesFrame>
        <SlideIndex slides={slides} />
      </SlidesFrame>
    </>
  );
}
