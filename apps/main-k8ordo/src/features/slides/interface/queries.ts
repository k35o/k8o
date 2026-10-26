import { findSlideMetadata } from '@/features/slides/application/slide';
import { getSlides } from '@/features/slides/application/slides';
import { memoizeInBuild } from '@/shared/cache/memoize-in-build';

export const getSlideContents = memoizeInBuild(async () => {
  const slides = await getSlides();
  const contents = await Promise.all(
    slides.map(async (slide) => {
      const metadata = await findSlideMetadata(slide.slug);
      if (metadata === null) return null;
      return {
        id: slide.id,
        slug: slide.slug,
        tags: slide.tags,
        title: metadata.title,
        description: metadata.description,
        createdAt: metadata.createdAt,
        updatedAt: metadata.updatedAt,
      };
    }),
  );
  return contents.filter((content) => content !== null);
});
