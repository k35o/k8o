import { formatDate } from '@repo/helpers/date/format';
import { buildRssFeed } from '@repo/helpers/feed/build-rss';

import { findDigestsSince } from '../infrastructure/digest-repository';
import type { StoredReadingDigest } from '../infrastructure/digest-repository';
import {
  findArticleSources,
  findRecentArticles,
} from '../infrastructure/reading-list-repository';
import type {
  ReadingListArticle,
  ReadingListSource,
} from '../infrastructure/reading-list-repository';
import { digestDateOf, toReadingDays } from './digest-days';
import type { ReadingDay } from './digest-days';
import { READING_LIST_FEED_URL, READING_LIST_URL } from './reading-list-url';
import { readingWindowStart } from './reading-window';

const findRecentReadings = (
  nowMs: number,
): Promise<[ReadingListArticle[], StoredReadingDigest[]]> => {
  const since = readingWindowStart(nowMs).toISOString();
  return Promise.all([
    findRecentArticles(since),
    findDigestsSince(digestDateOf(since)),
  ]);
};

export const getReadingList = async (
  nowMs: number,
): Promise<{
  articles: ReadingListArticle[];
  sources: ReadingListSource[];
  // 日ごとの話題。新しい日から。話題をまだ作っていない日は入らない
  digests: StoredReadingDigest[];
  // 記事を日ごとのまとめに入れたもの。新しい日から
  days: ReadingDay[];
}> => {
  const [[articles, digests], sources] = await Promise.all([
    findRecentReadings(nowMs),
    findArticleSources(),
  ]);
  return {
    articles,
    sources,
    digests,
    days: toReadingDays(articles, digests),
  };
};

const escapeHtml = (text: string): string =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

// リーダーは description を HTML として描く。記事の題やまとめの文は外から来るので、HTML の字にして入れる
const digestHtml = (overview: string, day: ReadingDay): string =>
  [
    `<p>${escapeHtml(overview)}</p>`,
    ...(day.picks.length === 0
      ? []
      : [
          '<h3>見てほしい記事</h3><ul>',
          ...day.picks.map(
            ({ article, reason }) =>
              `<li><a href="${escapeHtml(article.url)}">${escapeHtml(article.title)}</a>（${escapeHtml(article.sourceTitle)}）<br>${escapeHtml(reason)}</li>`,
          ),
          '</ul>',
        ]),
    ...(day.topics.length === 0
      ? []
      : [
          '<h3>話題</h3><ul>',
          ...day.topics.map(
            ({ headline, articles }) =>
              `<li>${escapeHtml(headline)}（${articles.length}件）</li>`,
          ),
          '</ul>',
        ]),
    '<p>まとめはClaudeが書いています。</p>',
  ].join('');

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
