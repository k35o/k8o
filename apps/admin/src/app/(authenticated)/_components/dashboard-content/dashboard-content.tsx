import { Card, Separator } from '@k8o/arte-odyssey';
import { db } from '@repo/database';
import { count, desc, eq, sum } from 'drizzle-orm';
import Link from 'next/link';
import { StatCard } from '../stat-card/stat-card';

export const DashboardContent = async () => {
  'use cache';
  const [blogCount, totalViews, articleCount, sourceCount, recentArticles] =
    await Promise.all([
      db
        .select({ value: count() })
        .from(db._schema.blogs)
        .where(eq(db._schema.blogs.published, true))
        .then((r) => r[0]?.value ?? 0),
      db
        .select({ value: sum(db._schema.blogViews.views) })
        .from(db._schema.blogViews)
        .then((r) => Number(r[0]?.value ?? 0)),
      db
        .select({ value: count() })
        .from(db._schema.articles)
        .then((r) => r[0]?.value ?? 0),
      db
        .select({ value: count() })
        .from(db._schema.articleSources)
        .then((r) => r[0]?.value ?? 0),
      db.query.articles.findMany({
        with: { articleSource: true },
        orderBy: (articles) => [desc(articles.publishedAt)],
        limit: 5,
      }),
    ]);

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
