import { db } from '@repo/database';
import { compareDate } from '@repo/helpers/date/compare';
import { eq } from 'drizzle-orm';
import Parser from 'rss-parser';

const parser = new Parser();

function sanitizeFeedDates(xml: string): string {
  return xml.replace(
    /<(updated|published)>([^<]+)<\/\1>/g,
    (match, tag, value) => {
      if (Number.isNaN(new Date(value).getTime())) {
        return `<${tag}></${tag}>`;
      }
      return match;
    },
  );
}

async function fetchFeed(url: string): Promise<Parser.Output<Parser.Item>> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `フィード取得失敗: ${response.status} ${response.statusText}`,
    );
  }
  const xml = await response.text();
  return parser.parseString(sanitizeFeedDates(xml));
}

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

type FeedArticle = {
  articleSourceId: number;
  title: string;
  url: string;
  publishedAt: string;
};

type SyncResult = {
  newArticles: number;
  updatedArticles: number;
  failedSources: string[];
};

export async function syncArticles(): Promise<SyncResult> {
  const sources = await db.query.articleSources.findMany({
    where: eq(db._schema.articleSources.type, 'feed'),
  });

  const ninetyDaysAgo = new Date(Date.now() - NINETY_DAYS_MS);

  const results = await Promise.allSettled(
    sources.map(async (source) => {
      const feed = await fetchFeed(source.url);
      const candidates: FeedArticle[] = [];

      for (const item of feed.items) {
        const publishedAt = item.isoDate ?? item.pubDate;
        if (!(item.link && item.title && publishedAt)) {
          continue;
        }

        if (compareDate(new Date(publishedAt), ninetyDaysAgo) === 'less') {
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
  const allCandidates: FeedArticle[] = [];

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
    columns: { url: true, title: true },
  });
  const existingByUrl = new Map(existingArticles.map((a) => [a.url, a.title]));

  const newArticles: FeedArticle[] = [];
  const articlesToUpdate: { url: string; title: string }[] = [];

  for (const candidate of allCandidates) {
    const existingTitle = existingByUrl.get(candidate.url);
    if (existingTitle === undefined) {
      newArticles.push(candidate);
    } else if (existingTitle !== candidate.title) {
      articlesToUpdate.push({
        url: candidate.url,
        title: candidate.title,
      });
    }
  }

  if (newArticles.length > 0) {
    await db.insert(db._schema.articles).values(newArticles);
  }

  if (articlesToUpdate.length > 0) {
    const now = new Date().toISOString();
    await Promise.all(
      articlesToUpdate.map((article) =>
        db
          .update(db._schema.articles)
          .set({ title: article.title, updatedAt: now })
          .where(eq(db._schema.articles.url, article.url)),
      ),
    );
  }

  return {
    newArticles: newArticles.length,
    updatedArticles: articlesToUpdate.length,
    failedSources,
  };
}
