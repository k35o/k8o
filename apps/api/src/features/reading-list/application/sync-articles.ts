import { mapWithConcurrency } from '@repo/helpers/array/map-with-concurrency';
import { fetchOgMetadata } from '@repo/helpers/og/fetch-og-metadata';
import { isPublicHttpsUrl } from '@repo/helpers/url/is-public-https-url';

import { fetchBrowserReleaseItems } from '../infrastructure/browser-release-source';
import { fetchDevsiteBlogItems } from '../infrastructure/devsite-blog-source';
import { fetchFeedItems } from '../infrastructure/feed-source';
import type { FeedItem } from '../infrastructure/feed-source';
import {
  findArticleTitlesByUrls,
  findArticleSources,
  insertArticlesIgnoringDuplicates,
  updateArticleTitles,
} from '../infrastructure/reading-list-repository';
import type { ArticleSource } from '../infrastructure/reading-list-repository';
import { readingWindowStart } from './reading-window';

const OG_CONCURRENCY = 5;
const MAX_TITLE_CHARS = 120;
const MAX_DESCRIPTION_CHARS = 300;

const graphemeSegmenter = new Intl.Segmenter(undefined, {
  granularity: 'grapheme',
});

const truncate = (text: string, max: number): string => {
  const graphemes = Array.from(
    graphemeSegmenter.segment(text),
    ({ segment }) => segment,
  );
  return graphemes.length <= max
    ? text
    : `${graphemes.slice(0, max - 1).join('')}…`;
};

const firstSentence = (text: string): string => {
  const end = text.search(/[.!?。](?=\s|$)/u);
  return end === -1 ? text : text.slice(0, end + 1);
};

const fetchSourceItems = (source: ArticleSource): Promise<FeedItem[]> => {
  switch (source.type) {
    case 'feed':
      return fetchFeedItems(source.url);
    case 'browser-releases':
      return fetchBrowserReleaseItems(source.url);
    case 'devsite-blog':
      return fetchDevsiteBlogItems(source.url);
  }
};

type FeedArticle = {
  articleSourceId: number;
  title: string;
  url: string;
  publishedAt: string;
  body: string | null;
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
      const items = await fetchSourceItems(source);
      const candidates: FeedArticle[] = [];
      const titles = items.flatMap(({ title }) =>
        title === undefined ? [] : [title],
      );
      const titlesRepeat = new Set(titles).size < titles.length;

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

        // ページの中の場所を指す項目のページには、ほかの項目も載っている。本文はページではなく
        // フィードの項目から取る。題が日付のように項目の間で重なるフィードは、題で項目を
        // 見分けられないので、本文の最初の文を題にする
        const body =
          item.text !== undefined && new URL(item.link).hash !== ''
            ? item.text
            : null;
        candidates.push({
          articleSourceId: source.id,
          title:
            body !== null && titlesRepeat
              ? truncate(firstSentence(body), MAX_TITLE_CHARS)
              : item.title,
          url: item.link,
          publishedAt: publishedDate.toISOString(),
          body,
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
        if (article.body !== null) {
          return {
            ...article,
            imageUrl: null,
            description: truncate(article.body, MAX_DESCRIPTION_CHARS),
          };
        }
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
