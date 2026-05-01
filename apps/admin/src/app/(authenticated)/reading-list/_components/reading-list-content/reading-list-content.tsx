import { LinkButton } from '@k8o/arte-odyssey';

import { StatCard } from '@/app/(authenticated)/_components/stat-card/stat-card';
import { getReadingListContentData } from '@/features/reading-list/interface/queries';

import { ArticleTable } from '../article-table/article-table';
import { SourceList } from '../source-list/source-list';
import { SyncButton } from '../sync-button/sync-button';

export const ReadingListContent = async () => {
  const { sources, articleItems, feedCount, articleCount } =
    await getReadingListContentData();

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="ソース" value={String(sources.length)} />
        <StatCard
          description="自動取得"
          label="フィード"
          value={String(feedCount)}
        />
        <StatCard label="取得済み記事" value={String(articleCount)} />
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">ソース</h3>
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
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">取得済み記事</h3>
          <SyncButton />
        </div>
        <ArticleTable articles={articleItems} />
      </section>
    </>
  );
};
