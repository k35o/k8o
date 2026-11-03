import { db } from '@repo/database';

export const findTagRows = async () =>
  db.query.tags.findMany({
    columns: {
      id: true,
      name: true,
    },
    with: {
      blogTag: {
        with: {
          blog: true,
        },
      },
      talkTag: {
        with: {
          talk: true,
        },
      },
    },
    orderBy: (fields, { asc }) => asc(fields.name),
  });

export const findTagRow = async (id: number) =>
  db.query.tags.findFirst({
    where: (tagFields, { eq }) => eq(tagFields.id, id),
    with: {
      blogTag: {
        with: {
          blog: true,
        },
      },
      talkTag: {
        with: {
          talk: true,
        },
      },
    },
  });
