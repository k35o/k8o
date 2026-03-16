import { getArticles } from '@/services/reading-list/reading-list';
import { LinkCard } from '../_components/link-card';

export default async function Page() {
  const articles = await getArticles();

  if (articles.length === 0) {
    return <p className="text-fg-mute text-sm">まだ記事がありません。</p>;
  }

  return (
    <div className="grid grid-cols-auto-fill-80 gap-3">
      {articles.map((article) => (
        <LinkCard href={article.url} key={article.id} variant="vertical" />
      ))}
    </div>
  );
}
