import {
  getArticleSources,
  getArticles,
} from '@/services/reading-list/reading-list';
import { LinkCard } from '../_components/link-card';
import { ReadingListContent } from './_components/reading-list-content';

export default async function Page() {
  const [articles, sources] = await Promise.all([
    getArticles(),
    getArticleSources(),
  ]);

  const articleCountBySource = new Map<number, number>();
  for (const article of articles) {
    const count = articleCountBySource.get(article.source.id) ?? 0;
    articleCountBySource.set(article.source.id, count + 1);
  }

  const sourcesWithCount = sources.map((source) => ({
    ...source,
    articleCount: articleCountBySource.get(source.id) ?? 0,
  }));

  const articleMeta = articles.map((article) => ({
    id: article.id,
    title: article.title,
    publishedAt: article.publishedAt,
    sourceId: article.source.id,
  }));

  return (
    <ReadingListContent articles={articleMeta} sources={sourcesWithCount}>
      {articles.map((article) => (
        <LinkCard href={article.url} key={article.id} variant="vertical" />
      ))}
    </ReadingListContent>
  );
}
