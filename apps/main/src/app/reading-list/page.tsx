import { getArticles } from '@/services/reading-list/reading-list';
import { ArticleCard } from './_components/article-card';

export default async function Page() {
  const articles = await getArticles();

  if (articles.length === 0) {
    return <p className="text-fg-mute text-sm">まだ記事がありません。</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {articles.map((article) => (
        <ArticleCard key={article.id} {...article} />
      ))}
    </div>
  );
}
