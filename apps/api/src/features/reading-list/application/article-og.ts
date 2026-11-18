import { mapWithConcurrency } from '@repo/helpers/array/map-with-concurrency';
import { fetchOgMetadata } from '@repo/helpers/og/fetch-og-metadata';

const OG_CONCURRENCY = 5;

type ArticleOg = {
  imageUrl: string | null;
  description: string | null;
};

export const mapWithArticleOg = <Article extends { url: string }, Result>(
  articles: readonly Article[],
  fn: (article: Article, og: ArticleOg) => Result | Promise<Result>,
): Promise<Result[]> =>
  mapWithConcurrency(articles, OG_CONCURRENCY, async (article) => {
    const og = await fetchOgMetadata(article.url);
    return fn(article, {
      imageUrl: og.imageUrl ?? null,
      description: og.description ?? null,
    });
  });
