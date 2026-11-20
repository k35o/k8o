import { buildRssFeed } from '@repo/helpers/feed/build-rss';

import { findDigestsSince } from '../infrastructure/digest-repository';
import type { ReadingDigest } from '../infrastructure/digest-repository';
import {
  findArticleSources,
  findRecentArticles,
} from '../infrastructure/reading-list-repository';
import type {
  ReadingListArticle,
  ReadingListSource,
} from '../infrastructure/reading-list-repository';
import { digestDateOf } from './digest-days';
import { READING_LIST_FEED_URL, READING_LIST_URL } from './reading-list-url';
import { readingWindowStart } from './reading-window';

const findArticlesSince90Days = (
  nowMs: number,
): Promise<ReadingListArticle[]> =>
  findRecentArticles(readingWindowStart(nowMs).toISOString());

export const getReadingList = async (
  nowMs: number,
): Promise<{
  articles: ReadingListArticle[];
  sources: ReadingListSource[];
  // 日ごとの話題。新しい日から。話題をまだ作っていない日は入らない
  digests: ReadingDigest[];
}> => {
  const [articles, sources, digests] = await Promise.all([
    findArticlesSince90Days(nowMs),
    findArticleSources(),
    findDigestsSince(digestDateOf(readingWindowStart(nowMs).toISOString())),
  ]);
  return { articles, sources, digests };
};

export const getReadingListFeed = async (nowMs: number): Promise<string> => {
  const articles = await findArticlesSince90Days(nowMs);
  return buildRssFeed({
    title: 'k8o Readings',
    description: 'AIとWebフロントエンドまわりの記事を集めています。',
    feedUrl: READING_LIST_FEED_URL,
    siteUrl: READING_LIST_URL,
    items: articles.map((article) => ({
      title: article.title,
      // summary は本人ではなく AI が生成した紹介文のため、購読者にも分かるよう明示する。
      // 元記事の description にフォールバックする場合は印を付けない
      description:
        article.summary === null
          ? (article.description ?? '')
          : `【AI要約】${article.summary}`,
      url: article.url,
      date: article.publishedAt,
      categories: [article.source.title],
    })),
  });
};
