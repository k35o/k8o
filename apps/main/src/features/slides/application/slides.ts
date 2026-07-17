import { db } from '@repo/database';

export const getSlides = async () => {
  const slideRows = await db.query.slides.findMany({
    with: {
      slideTag: {
        with: {
          tag: true,
        },
      },
    },
    where: (slideFields, { eq }) => eq(slideFields.published, true),
    orderBy(fields, operators) {
      return [operators.desc(fields.createdAt), operators.desc(fields.id)];
    },
  });

  return slideRows.map((slide) => ({
    id: slide.id,
    slug: slide.slug,
    tags: slide.slideTag.map((slideTag) => slideTag.tag.name),
  }));
};
