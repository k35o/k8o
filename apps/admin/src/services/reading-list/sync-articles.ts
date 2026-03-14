import { db } from '@repo/database';
import { compareDate } from '@repo/helpers/date/compare';
import { eq } from 'drizzle-orm';
import Parser from 'rss-parser';

const parser = new Parser();

type NewArticle = {
  articleSourceId: number;
  title: string;
  url: string;
  publishedAt: string;
};

type SyncResult = {
  newArticles: number;
  failedSources: string[];
};

export async function syncArticles(): Promise<SyncResult> {
  const sources = await db.query.articleSources.findMany({
    where: eq(db._schema.articleSources.type, 'feed'),
  });

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const results = await Promise.allSettled(
    sources.map(async (source) => {
      const feed = await parser.parseURL(source.url);
      const candidates: NewArticle[] = [];

      for (const item of feed.items) {
        const publishedAt = item.isoDate ?? item.pubDate;
        if (!(item.link && item.title && publishedAt)) {
          continue;
        }

        if (compareDate(new Date(publishedAt), oneWeekAgo) === 'less') {
          continue;
        }

        candidates.push({
          articleSourceId: source.id,
          title: item.title,
          url: item.link,
          publishedAt,
        });
      }

      return candidates;
    }),
  );

  const failedSources: string[] = [];
  const allCandidates: NewArticle[] = [];

  for (const [i, result] of results.entries()) {
    const source = sources[i];
    if (result.status === 'fulfilled') {
      allCandidates.push(...result.value);
    } else if (source) {
      failedSources.push(source.title);
      console.error(
        `フィード取得失敗: ${source.title} (${source.url})`,
        result.reason,
      );
    }
  }

  const existingArticles = await db.query.articles.findMany({
    columns: { url: true },
  });
  const existingUrls = new Set(existingArticles.map((a) => a.url));

  const newArticles = allCandidates.filter(
    (candidate) => !existingUrls.has(candidate.url),
  );

  if (newArticles.length > 0) {
    await db.insert(db._schema.articles).values(newArticles);
  }

  return {
    newArticles: newArticles.length,
    failedSources,
  };
}
