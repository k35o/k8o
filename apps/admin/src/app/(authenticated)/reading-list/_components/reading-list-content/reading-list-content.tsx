import { LinkButton } from '@k8o/arte-odyssey/link-button';
import { db } from '@repo/database';
import { desc } from 'drizzle-orm';
import { StatCard } from '@/app/(authenticated)/_components/stat-card/stat-card';
import { ArticleTable } from '../article-table/article-table';
import { SourceList } from '../source-list/source-list';

export const ReadingListContent = async () => {
  'use cache';
  const [sources, articles] = await Promise.all([
    db.query.articleSources.findMany({
      orderBy: (articleSources) => [desc(articleSources.updatedAt)],
    }),
    db.query.articles.findMany({
      with: { articleSource: true },
      orderBy: (articles) => [desc(articles.publishedAt)],
    }),
  ]);

  const feedCount = sources.filter((s) => s.type === 'feed').length;

  const articleItems = articles.map((a) => ({
    id: a.id,
    title: a.title,
    url: a.url,
    publishedAt: a.publishedAt,
    sourceName: a.articleSource.title,
  }));

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="ソース" value={String(sources.length)} />
        <StatCard
          description="自動取得"
          label="フィード"
          value={String(feedCount)}
        />
        <StatCard label="取得済み記事" value={String(articles.length)} />
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">ソース</h3>
          <LinkButton
            color="primary"
            href="/reading-list/sources/new"
            size="sm"
            variant="contained"
          >
            追加
          </LinkButton>
        </div>
        <SourceList sources={sources} />
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-bold text-lg">取得済み記事</h3>
        <ArticleTable articles={articleItems} />
      </section>
    </>
  );
};
