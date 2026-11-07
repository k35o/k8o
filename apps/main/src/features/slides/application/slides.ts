import { findPublishedSlideRows } from '../infrastructure/slide-repository';
import { findSlideMetadata } from './slide';

export const getSlides = async () => {
  const slideRows = await findPublishedSlideRows();
  const slides = await Promise.all(
    slideRows.map(async (slide) => {
      const metadata = await findSlideMetadata(slide.slug);
      if (metadata === null) {
        return null;
      }
      return {
        id: slide.id,
        slug: slide.slug,
        tags: slide.slideTag.map((slideTag) => slideTag.tag.name),
        title: metadata.title,
        description: metadata.description,
        createdAt: metadata.createdAt,
        updatedAt: metadata.updatedAt,
      };
    }),
  );
  return slides.filter((slide) => slide !== null);
};
