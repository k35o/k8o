import { getSlideContents } from '@/features/slides/interface/queries';

import { SlideCard } from './_components/slide-card';

export default async function Page() {
  const slides = await getSlideContents();
  return (
    <div className="flex flex-col gap-4">
      {slides.map((slide) => (
        <SlideCard key={slide.id} {...slide} />
      ))}
    </div>
  );
}
