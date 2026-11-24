import { formatDate } from '@repo/helpers/date/format';
import { buildRssFeed } from '@repo/helpers/feed/build-rss';

import { findDigestsSince } from '../infrastructure/digest-repository';
import type { StoredReadingDigest } from '../infrastructure/digest-repository';
import { findRecentArticles } from '../infrastructure/reading-list-repository';
import type { ReadingArticle } from '../infrastructure/reading-list-repository';
import { digestHtml } from './digest-html';
import { readingDateOf } from './reading-date';
import { toReadingDays } from './reading-days';
import type { ReadingDay } from './reading-days';
import { READING_LIST_FEED_URL, READING_LIST_URL } from './reading-list-url';
import { readingWindowStart } from './reading-window';

const findRecentReadings = (
  nowMs: number,
): Promise<[ReadingArticle[], StoredReadingDigest[]]> => {
  const since = readingWindowStart(nowMs).toISOString();
  return Promise.all([
    findRecentArticles(since),
    findDigestsSince(readingDateOf(since)),
  ]);
};

// 直近 90 日の記事を、日ごとのまとめに入れて新しい日から返す
export const getReadingList = async (
  nowMs: number,
): Promise<{ days: ReadingDay[] }> => {
  const [articles, digests] = await findRecentReadings(nowMs);
  return { days: toReadingDays(articles, digests) };
};

// まとめのある日を、1 日 1 件で配る
export const getReadingListFeed = async (nowMs: number): Promise<string> => {
  const [articles, digests] = await findRecentReadings(nowMs);
  const dayByDate = new Map(
    toReadingDays(articles, digests).map((day) => [day.date, day]),
  );
  return buildRssFeed({
    title: 'k8o Readings',
    description:
      'AIとWebフロントエンドまわりの記事を、日ごとにまとめています。',
    feedUrl: READING_LIST_FEED_URL,
    siteUrl: READING_LIST_URL,
    items: digests.flatMap((digest) => {
      const day = dayByDate.get(digest.date);
      return day === undefined
        ? []
        : [
            {
              title: `${formatDate(new Date(`${digest.date}T00:00:00+09:00`), 'M月d日(E)')}のReadings`,
              description: digestHtml(digest.overview, day),
              url: `${READING_LIST_URL}#${digest.date}`,
              date: digest.createdAt,
              categories: [],
            },
          ];
    }),
  });
};
