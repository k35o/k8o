import { db } from '@repo/database';
import { and, desc, gte, lt } from '@repo/database/orm';
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

export type StoredReadingDigest = ReadingDigest & {
  // まとめを初めて作った時刻
  createdAt: string;
};

export const findDigestsSince = (
  sinceDate: string,
): Promise<StoredReadingDigest[]> =>
  db.query.readingDigests.findMany({
    columns: {
      date: true,
      overview: true,
      picks: true,
      topics: true,
      createdAt: true,
    },
    where: gte(db._schema.readingDigests.date, sinceDate),
    orderBy: (digests) => [desc(digests.date)],
  });

// sinceDate の日から、beforeDate の前の日までで、いちばん新しいまとめ
export const findLatestDigestBetween = async (
  sinceDate: string,
  beforeDate: string,
): Promise<ReadingDigest | null> =>
  (await db.query.readingDigests.findFirst({
    columns: { date: true, overview: true, picks: true, topics: true },
    where: and(
      gte(db._schema.readingDigests.date, sinceDate),
      lt(db._schema.readingDigests.date, beforeDate),
    ),
    orderBy: (digests) => [desc(digests.date)],
  })) ?? null;

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
