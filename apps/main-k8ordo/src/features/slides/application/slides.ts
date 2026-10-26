import { findPublishedSlideRows } from '../infrastructure/slide-repository';

export const getSlides = async () => {
  const slideRows = await findPublishedSlideRows();

  return slideRows.map((slide) => ({
    id: slide.id,
    slug: slide.slug,
    tags: slide.slideTag.map((slideTag) => slideTag.tag.name),
  }));
};
