import { mapWithConcurrency } from '@repo/helpers/array/map-with-concurrency';
import { fetchOgMetadata } from '@repo/helpers/og/fetch-og-metadata';
import { isPublicHttpsUrl } from '@repo/helpers/url/is-public-https-url';

import { fetchBrowserReleaseItems } from '../infrastructure/browser-release-source';
import { fetchFeedItems } from '../infrastructure/feed-source';
import {
  findArticleTitlesByUrls,
  findArticleSources,
  insertArticlesIgnoringDuplicates,
  updateArticleTitles,
} from '../infrastructure/reading-list-repository';
import { readingWindowStart } from './reading-window';

const OG_CONCURRENCY = 5;

type FeedArticle = {
  articleSourceId: number;
  title: string;
  url: string;
  publishedAt: string;
};

export type SyncResult = {
  newArticles: number;
  updatedArticles: number;
  failedSources: string[];
};

export async function syncArticles(): Promise<SyncResult> {
  const sources = await findArticleSources();

  const ninetyDaysAgo = readingWindowStart(Date.now());

  const results = await Promise.allSettled(
    sources.map(async (source) => {
      const items =
        source.type === 'browser-releases'
          ? await fetchBrowserReleaseItems(source.url)
          : await fetchFeedItems(source.url);
      const candidates: FeedArticle[] = [];

      for (const item of items) {
        if (
          item.link === undefined ||
          item.title === undefined ||
          item.publishedAt === undefined
        ) {
          continue;
        }

        // stored XSS 対策: フィード由来の URL は公開 https URL のみ保存する
        if (!isPublicHttpsUrl(item.link)) {
          continue;
        }

        // フィード由来の日付は生文字列が混ざりうるため、検証して ISO 8601 に正規化する
        const publishedDate = new Date(item.publishedAt);
        if (Number.isNaN(publishedDate.getTime())) {
          continue;
        }

        if (publishedDate.getTime() < ninetyDaysAgo.getTime()) {
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

  const existingArticles =
    allCandidates.length === 0
      ? []
      : await findArticleTitlesByUrls(allCandidates.map(({ url }) => url));
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
    await insertArticlesIgnoringDuplicates(newArticleRows);
  }

  if (articlesToUpdate.length > 0) {
    await updateArticleTitles(articlesToUpdate);
  }

  return {
    newArticles: newArticles.length,
    updatedArticles: articlesToUpdate.length,
    failedSources,
  };
}
