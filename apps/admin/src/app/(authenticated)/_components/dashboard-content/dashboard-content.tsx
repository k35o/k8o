import { Badge, BlogIcon, Card, RSSIcon, ViewIcon } from '@k8o/arte-odyssey';
import Link from 'next/link';

import {
  EmptyState,
  SectionHeader,
  StatCard,
} from '@/app/(authenticated)/_components';
import { getTopViewedBlogs } from '@/features/blog/interface/queries';
import { getDashboardSummary } from '@/features/dashboard/interface/queries';

const BLOG_BASE_URL = 'https://k8o.me/blog';

export const DashboardContent = async () => {
  const [
    { blogCount, totalViews, articleCount, sourceCount, recentArticles },
    topBlogs,
  ] = await Promise.all([getDashboardSummary(), getTopViewedBlogs(5)]);

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatCard
          icon={<BlogIcon size="md" />}
          label="ブログ記事"
          value={String(blogCount)}
        />
        <StatCard
          icon={<ViewIcon size="md" />}
          label="総閲覧数"
          value={totalViews.toLocaleString()}
        />
        <StatCard
          description={`${String(sourceCount)} ソース`}
          icon={<RSSIcon size="md" />}
          label="よんでいるもの"
          value={String(articleCount)}
        />
      </div>

      <section className="flex flex-col gap-4">
        <SectionHeader
          action={
            <Link
              className="text-fg-mute hover:text-fg-base text-sm transition-colors"
              href="/blogs"
            >
              すべて見る
            </Link>
          }
          title="人気記事"
        />
        {topBlogs.length === 0 ? (
          <EmptyState message="閲覧データがありません" />
        ) : (
          <Card appearance="shadow">
            <ol className="divide-border-mute divide-y">
              {topBlogs.map((blog, index) => (
                <li
                  className="flex items-center gap-3 px-5 py-3"
                  key={blog.slug}
                >
                  <span className="text-fg-mute w-5 shrink-0 text-sm tabular-nums">
                    {index + 1}
                  </span>
                  <a
                    className="min-w-0 flex-1 truncate text-sm hover:underline"
                    href={`${BLOG_BASE_URL}/${blog.slug}`}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {blog.slug}
                  </a>
                  {!blog.published && (
                    <Badge size="sm" text="下書き" tone="warning" />
                  )}
                  <span className="text-fg-mute shrink-0 text-sm tabular-nums">
                    {blog.views.toLocaleString()}
                  </span>
                </li>
              ))}
            </ol>
          </Card>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeader
          action={
            <Link
              className="text-fg-mute hover:text-fg-base text-sm transition-colors"
              href="/reading-list"
            >
              すべて見る
            </Link>
          }
          title="最近の取得記事"
        />
        {recentArticles.length === 0 ? (
          <EmptyState message="取得済みの記事はありません" />
        ) : (
          <Card appearance="shadow">
            <ul className="divide-border-mute divide-y">
              {recentArticles.map((article) => (
                <li className="px-5 py-4" key={article.id}>
                  <div className="flex items-baseline justify-between gap-4">
                    <a
                      className="truncate text-sm hover:underline"
                      href={article.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {article.title}
                    </a>
                    <span className="text-fg-mute shrink-0 text-xs">
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
