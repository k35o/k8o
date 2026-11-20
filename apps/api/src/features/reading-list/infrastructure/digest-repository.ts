import { db } from '@repo/database';
import { desc, gte } from '@repo/database/orm';
import type {
  ReadingDigestPick,
  ReadingDigestTopic,
} from '@repo/database/schema';

export type ReadingDigest = {
  date: string;
  overview: string;
  picks: ReadingDigestPick[];
  topics: ReadingDigestTopic[];
};

export const findDigestsSince = (sinceDate: string): Promise<ReadingDigest[]> =>
  db.query.readingDigests.findMany({
    columns: { date: true, overview: true, picks: true, topics: true },
    where: gte(db._schema.readingDigests.date, sinceDate),
    orderBy: (digests) => [desc(digests.date)],
  });

export const findDigestKeysSince = (
  sinceDate: string,
): Promise<Array<{ date: string; articleKey: string }>> =>
  db.query.readingDigests.findMany({
    columns: { date: true, articleKey: true },
    where: gte(db._schema.readingDigests.date, sinceDate),
  });

// Vercel Cron は同じ回を二重に起動し得るので、同じ日は上書きにする
export const saveDigest = async (
  digest: ReadingDigest & { articleKey: string },
): Promise<void> => {
  await db
    .insert(db._schema.readingDigests)
    .values(digest)
    .onConflictDoUpdate({
      target: db._schema.readingDigests.date,
      set: {
        overview: digest.overview,
        picks: digest.picks,
        topics: digest.topics,
        articleKey: digest.articleKey,
        updatedAt: new Date().toISOString(),
      },
    });
};
