import { NINETY_DAYS_MS } from '@repo/helpers/date/duration';
import { buildRssFeed } from '@repo/helpers/feed/build-rss';

import {
  findArticleSources,
  findRecentArticles,
} from '../infrastructure/reading-list-repository';
import type {
  ReadingListArticle,
  ReadingListSource,
} from '../infrastructure/reading-list-repository';

const READING_LIST_URL = 'https://k8o.me/reading-list';
export const READING_LIST_FEED_URL = `${READING_LIST_URL}/feed`;

const findArticlesSince90Days = (
  nowMs: number,
): Promise<ReadingListArticle[]> =>
  findRecentArticles(new Date(nowMs - NINETY_DAYS_MS).toISOString());

export const getReadingList = async (
  nowMs: number,
): Promise<{
  articles: ReadingListArticle[];
  sources: ReadingListSource[];
}> => {
  const [articles, sources] = await Promise.all([
    findArticlesSince90Days(nowMs),
    findArticleSources(),
  ]);
  return { articles, sources };
};

export const getReadingListFeed = async (nowMs: number): Promise<string> => {
  const articles = await findArticlesSince90Days(nowMs);
  return buildRssFeed({
    title: 'k8o Readings',
    description: '気になっている記事を集めて、あとから探せるようにしています。',
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
