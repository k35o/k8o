import {
  getArticleSources,
  getArticles,
} from '@/features/reading-list/interface/queries';

import { ReadingCard } from './_components/reading-card';
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

  const sourcesWithCount = [];
  for (const source of sources) {
    sourcesWithCount.push({
      ...source,
      articleCount: articleCountBySource.get(source.id) ?? 0,
    });
  }

  const articleMeta = articles.map((article) => ({
    id: article.id,
    title: article.title,
    publishedAt: article.publishedAt,
    sourceId: article.source.id,
  }));

  const cards: Record<number, React.ReactNode> = {};
  for (const article of articles) {
    cards[article.id] = (
      <ReadingCard
        articleId={article.id}
        description={article.description}
        imageUrl={article.imageUrl}
        key={article.id}
        publishedAt={article.publishedAt}
        sourceTitle={article.source.title}
        summary={article.summary}
        summaryGaveUp={article.summaryGaveUp}
        title={article.title}
        url={article.url}
      />
    );
  }

  return (
    <ReadingListContent
      articles={articleMeta}
      cards={cards}
      sources={sourcesWithCount}
    />
  );
}
