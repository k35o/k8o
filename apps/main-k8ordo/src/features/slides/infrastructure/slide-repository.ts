import { db } from '@repo/database';

export const findPublishedSlideRows = async () =>
  db.query.slides.findMany({
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
