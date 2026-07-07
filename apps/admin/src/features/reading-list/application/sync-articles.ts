import { db } from '@repo/database';
import { mapWithConcurrency } from '@repo/helpers/array/map-with-concurrency';
import { compareDate } from '@repo/helpers/date/compare';
import { NINETY_DAYS_MS } from '@repo/helpers/date/duration';
import { isPublicHttpsUrl } from '@repo/helpers/url/is-public-https-url';
import { safeFetch } from '@repo/helpers/url/safe-fetch';
import { eq } from 'drizzle-orm';
import Parser from 'rss-parser';

import { fetchOgMetadata } from '../infrastructure/og-metadata';

const parser = new Parser();

const OG_CONCURRENCY = 5;

function sanitizeFeedDates(xml: string): string {
  return xml.replaceAll(
    /<(updated|published)>([^<]+)<\/\1>/gu,
    (match: string, tag: string, value: string) => {
      if (Number.isNaN(new Date(value).getTime())) {
        return `<${tag}></${tag}>`;
      }
      return match;
    },
  );
}

async function fetchFeed(url: string): Promise<Parser.Output<Parser.Item>> {
  // SSRF 対策: 公開 https URL のみ許可し、リダイレクト先も都度検証する
  const response = await safeFetch(url);
  if (!response.ok) {
    throw new Error(
      `フィード取得失敗: ${response.status} ${response.statusText}`,
    );
  }
  const xml = await response.text();
  return parser.parseString(sanitizeFeedDates(xml));
}

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
        const rawPublishedAt = item.isoDate ?? item.pubDate;
        if (
          item.link === undefined ||
          item.title === undefined ||
          rawPublishedAt === undefined
        ) {
          continue;
        }

        // stored XSS 対策: フィード由来の URL は公開 https URL のみ保存する
        if (!isPublicHttpsUrl(item.link)) {
          continue;
        }

        // rss-parser はパース不能な pubDate のとき isoDate を設定しないため、
        // 生文字列が TEXT カラムに混ざらないよう検証して ISO 8601 に正規化する
        const publishedDate = new Date(rawPublishedAt);
        if (Number.isNaN(publishedDate.getTime())) {
          continue;
        }

        if (compareDate(publishedDate, ninetyDaysAgo) === 'less') {
          continue;
        }

        candidates.push({
          articleSourceId: source.id,
          title: item.title,
          url: item.link,
          publishedAt: publishedDate.toISOString(),
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
  const seenNewUrls = new Set<string>();
  const articlesToUpdate: Array<{ url: string; title: string }> = [];

  for (const candidate of allCandidates) {
    const existingTitle = existingByUrl.get(candidate.url);
    if (existingTitle === undefined) {
      // 複数フィードが同一 URL を配信する/同一フィードに同じ link が複数回現れると、
      // articles_url_idx(unique) 違反で INSERT 全体が失敗するため、この同期内で重複排除する
      if (seenNewUrls.has(candidate.url)) {
        continue;
      }
      seenNewUrls.add(candidate.url);
      newArticles.push(candidate);
    } else if (existingTitle !== candidate.title) {
      articlesToUpdate.push({
        url: candidate.url,
        title: candidate.title,
      });
    }
  }

  if (newArticles.length > 0) {
    const newArticleRows = await mapWithConcurrency(
      newArticles,
      OG_CONCURRENCY,
      async (article) => {
        const og = await fetchOgMetadata(article.url);
        return {
          ...article,
          imageUrl: og.imageUrl ?? null,
          description: og.description ?? null,
        };
      },
    );
    // cron と手動同期の並走で同一 URL が同時に入り得るため、unique 違反を握って冪等にする
    await db
      .insert(db._schema.articles)
      .values(newArticleRows)
      .onConflictDoNothing({ target: db._schema.articles.url });
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
