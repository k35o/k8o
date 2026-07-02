import { db } from '@repo/database';
import { NINETY_DAYS_MS } from '@repo/helpers/date/duration';
import { desc, gte } from 'drizzle-orm';

import { MAX_SUMMARY_ATTEMPTS } from './summary-policy';

export async function getArticles() {
  const ninetyDaysAgo = new Date(Date.now() - NINETY_DAYS_MS).toISOString();

  const results = await db.query.articles.findMany({
    with: {
      articleSource: true,
    },
    where: gte(db._schema.articles.publishedAt, ninetyDaysAgo),
    orderBy: (articles) => [desc(articles.publishedAt)],
  });

  return results.map((article) => ({
    id: article.id,
    title: article.title,
    url: article.url,
    publishedAt: article.publishedAt,
    imageUrl: article.imageUrl,
    description: article.description,
    summary: article.summary,
    // 上限まで試行しても summary が無い記事は再生成を試みず、説明文のまま確定表示する
    // （試行回数は生成開始前に予約 increment されるため、成功した記事でも上限に達しうる）
    summaryGaveUp:
      article.summary === null &&
      article.summaryAttempts >= MAX_SUMMARY_ATTEMPTS,
    source: {
      id: article.articleSource.id,
      title: article.articleSource.title,
      siteUrl: article.articleSource.siteUrl,
    },
  }));
}

export async function getArticleSources() {
  const results = await db.query.articleSources.findMany({
    orderBy: (sources) => [sources.title],
  });

  return results.map((source) => ({
    id: source.id,
    title: source.title,
  }));
}
