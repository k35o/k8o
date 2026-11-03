import { db } from '@repo/database';

export const findTalkRows = async () =>
  db.query.talks.findMany({
    with: {
      blog: true,
      talkTag: {
        with: {
          tag: true,
        },
      },
    },
  });
