import { Card, Separator } from '@k8o/arte-odyssey';
import Link from 'next/link';
import { getDashboardSummary } from '@/features/dashboard/interface/queries';
import { StatCard } from '../stat-card/stat-card';

export const DashboardContent = async () => {
  const { blogCount, totalViews, articleCount, sourceCount, recentArticles } =
    await getDashboardSummary();

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="ブログ記事" value={String(blogCount)} />
        <StatCard label="総閲覧数" value={totalViews.toLocaleString()} />
        <StatCard
          description={`${String(sourceCount)} ソース`}
          label="よんでいるもの"
          value={String(articleCount)}
        />
      </div>

      <Separator />

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">最近の取得記事</h3>
          <Link
            className="text-fg-mute text-sm transition-colors hover:text-fg-base"
            href="/reading-list"
          >
            すべて見る
          </Link>
        </div>
        {recentArticles.length === 0 ? (
          <p className="text-fg-mute text-sm">取得済みの記事はありません</p>
        ) : (
          <Card>
            <ul className="divide-y divide-border-base">
              {recentArticles.map((article) => (
                <li className="px-4 py-3" key={article.id}>
                  <div className="flex items-baseline justify-between gap-4">
                    <a
                      className="truncate text-sm hover:underline"
                      href={article.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {article.title}
                    </a>
                    <span className="shrink-0 text-fg-mute text-xs">
                      {article.articleSource.title}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>
    </>
  );
};
