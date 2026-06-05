import { ListIcon, NewsIcon, RSSIcon } from '@k8o/arte-odyssey';

import {
  ListPagination,
  SearchField,
  SectionHeader,
  StatCard,
} from '@/app/(authenticated)/_components';
import {
  getArticles,
  getReadingListContentData,
} from '@/features/reading-list/interface/queries';
import { verifySession } from '@/shared/auth/verify-session';
import {
  firstParam,
  getTotalPages,
  parsePageParam,
} from '@/shared/search-params';

import { AddArticleLink } from '../add-article-link';
import { AddSourceLink } from '../add-source-link';
import { ArticleTable } from '../article-table/article-table';
import { SourceList } from '../source-list/source-list';
import { SyncButton } from '../sync-button/sync-button';

const PAGE_SIZE = 20;

export const ReadingListContent = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  await verifySession();

  const sp = await searchParams;
  const q = firstParam(sp['q']) ?? '';
  const page = parsePageParam(firstParam(sp['page']));

  const [{ sources, feedCount, articleCount }, { items, total }] =
    await Promise.all([
      getReadingListContentData(),
      getArticles({ q, page, pageSize: PAGE_SIZE }),
    ]);
  const totalPages = getTotalPages(total, PAGE_SIZE);

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatCard
          icon={<ListIcon size="md" />}
          label="ソース"
          value={String(sources.length)}
        />
        <StatCard
          description="自動取得"
          icon={<RSSIcon size="md" />}
          label="フィード"
          value={String(feedCount)}
        />
        <StatCard
          icon={<NewsIcon size="md" />}
          label="取得済み記事"
          value={String(articleCount)}
        />
      </div>

      <section className="flex flex-col gap-4">
        <SectionHeader action={<AddSourceLink />} title="ソース" />
        <SourceList sources={sources} />
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeader
          action={
            <div className="flex items-center gap-2">
              <AddArticleLink />
              <SyncButton />
            </div>
          }
          title="取得済み記事"
        />
        <SearchField placeholder="タイトルで検索" />
        <ArticleTable articles={items} />
        <div className="flex justify-center">
          <ListPagination currentPage={page} totalPages={totalPages} />
        </div>
      </section>
    </>
  );
};
