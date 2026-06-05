import {
  FilterSelect,
  ListPagination,
  PageHeader,
  SearchField,
} from '@/app/(authenticated)/_components';
import {
  type BlogSort,
  type BlogStatus,
  getBlogs,
} from '@/features/blog/interface/queries';
import { verifySession } from '@/shared/auth/verify-session';
import {
  firstParam,
  getTotalPages,
  parsePageParam,
} from '@/shared/search-params';

import { BlogTable } from './_components/blog-table';

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
  { value: 'all', label: 'すべて' },
  { value: 'published', label: '公開' },
  { value: 'draft', label: '下書き' },
] as const;

const SORT_OPTIONS = [
  { value: 'recent', label: '新着順' },
  { value: 'views', label: '閲覧数順' },
] as const;

const parseStatus = (value: string | undefined): BlogStatus =>
  value === 'published' || value === 'draft' ? value : 'all';

const parseSort = (value: string | undefined): BlogSort =>
  value === 'views' ? 'views' : 'recent';

export default async function BlogsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await verifySession();

  const sp = await searchParams;
  const q = firstParam(sp['q']) ?? '';
  const status = parseStatus(firstParam(sp['status']));
  const sort = parseSort(firstParam(sp['sort']));
  const page = parsePageParam(firstParam(sp['page']));

  const { items, total } = await getBlogs({
    q,
    status,
    sort,
    page,
    pageSize: PAGE_SIZE,
  });
  const totalPages = getTotalPages(total, PAGE_SIZE);

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        description="記事の公開状態・閲覧数・コメント数を管理します（タイトル/本文は MDX 管理のため slug で表示）。"
        title="ブログ"
      />

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchField placeholder="slug で検索" />
          <div className="sm:w-40">
            <FilterSelect
              label="公開状態で絞り込み"
              options={STATUS_OPTIONS}
              paramKey="status"
            />
          </div>
          <div className="sm:w-40">
            <FilterSelect
              label="並び順"
              options={SORT_OPTIONS}
              paramKey="sort"
            />
          </div>
        </div>
        <BlogTable blogs={items} />
        <div className="flex justify-center">
          <ListPagination currentPage={page} totalPages={totalPages} />
        </div>
      </section>
    </div>
  );
}
