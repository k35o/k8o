import { formatDate } from '@repo/helpers/date/format';
import { buildRssFeed } from '@repo/helpers/feed/build-rss';

import {
  findDigestsSince,
  findLatestDigestBetween,
} from '../infrastructure/digest-repository';
import type { StoredReadingDigest } from '../infrastructure/digest-repository';
import { findRecentArticles } from '../infrastructure/reading-list-repository';
import { digestHtml } from './digest-html';
import { readingDateOf } from './reading-date';
import { toReadingDays } from './reading-days';
import type { ReadingDay } from './reading-days';
import { READING_LIST_FEED_URL, READING_LIST_URL } from './reading-list-url';
import { readingWindowStart } from './reading-window';

// 日付の変わり目ではなく、前日までの記事を取り込み終える同期（vercel.json の cron、00:00 UTC）の
// 日本時間 9 時を境に、前日の分を出す。日付の変わり目で出すと、前日の途中の形を見せて、翌朝にもう一度見させる
const PUBLISH_DELAY_MS = 9 * 60 * 60 * 1000;

const firstUnpublishedDateOf = (nowMs: number): string =>
  readingDateOf(new Date(nowMs - PUBLISH_DELAY_MS).toISOString());

const findPublishedReadings = async (
  nowMs: number,
): Promise<{ days: ReadingDay[]; digests: StoredReadingDigest[] }> => {
  const since = readingWindowStart(nowMs).toISOString();
  const [articles, digests] = await Promise.all([
    findRecentArticles(since),
    findDigestsSince(readingDateOf(since)),
  ]);
  const firstUnpublishedDate = firstUnpublishedDateOf(nowMs);
  return {
    days: toReadingDays(articles, digests).filter(
      ({ date }) => date < firstUnpublishedDate,
    ),
    digests,
  };
};

// 直近 90 日のうち出した日の記事を、日ごとのまとめに入れて新しい日から返す
export const getReadingList = async (
  nowMs: number,
): Promise<{ days: ReadingDay[] }> => {
  const { days } = await findPublishedReadings(nowMs);
  return { days };
};

// 出した日のうちまとめのある最新の日を、getReadingList の 1 日と同じ形で返す
export const getLatestReadingDay = async (
  nowMs: number,
): Promise<{ day: ReadingDay | null }> => {
  const digest = await findLatestDigestBetween(
    readingDateOf(readingWindowStart(nowMs).toISOString()),
    firstUnpublishedDateOf(nowMs),
  );
  if (digest === null) {
    return { day: null };
  }
  const articles = await findRecentArticles(
    new Date(`${digest.date}T00:00:00+09:00`).toISOString(),
  );
  return {
    day:
      toReadingDays(articles, [digest]).find(
        ({ date }) => date === digest.date,
      ) ?? null,
  };
};

// 出した日のうちまとめのある日を、1 日 1 件で配る
export const getReadingListFeed = async (nowMs: number): Promise<string> => {
  const { days, digests } = await findPublishedReadings(nowMs);
  const dayByDate = new Map(days.map((day) => [day.date, day]));
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
