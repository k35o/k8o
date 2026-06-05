import {
  FilterSelect,
  ListPagination,
  SearchField,
  SectionHeader,
} from '@/app/(authenticated)/_components';
import {
  type BaselineStatus,
  getBaselineSnapshots,
} from '@/features/baseline/interface/queries';
import { verifySession } from '@/shared/auth/verify-session';
import {
  firstParam,
  getTotalPages,
  parsePageParam,
} from '@/shared/search-params';

import { BaselineSnapshotList } from '../baseline-snapshot-list';
import { BaselineSnapshotStats } from '../baseline-snapshot-stats';

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
  { value: 'all', label: 'すべて' },
  { value: 'newly', label: 'Newly' },
  { value: 'widely', label: 'Widely' },
] as const;

const parseStatus = (value: string | undefined): BaselineStatus | 'all' =>
  value === 'newly' || value === 'widely' ? value : 'all';

export const BaselineContent = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  await verifySession();

  const sp = await searchParams;
  const status = parseStatus(firstParam(sp['status']));
  const q = firstParam(sp['q']) ?? '';
  const page = parsePageParam(firstParam(sp['page']));

  const { items, total } = await getBaselineSnapshots({
    status,
    q,
    page,
    pageSize: PAGE_SIZE,
  });
  const totalPages = getTotalPages(total, PAGE_SIZE);

  return (
    <>
      <BaselineSnapshotStats />

      <section className="flex flex-col gap-4">
        <SectionHeader title="スナップショット一覧" />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchField placeholder="機能名で検索" />
          <div className="sm:w-40">
            <FilterSelect
              label="ステータスで絞り込み"
              options={STATUS_OPTIONS}
              paramKey="status"
            />
          </div>
        </div>
        <BaselineSnapshotList snapshots={items} />
        <div className="flex justify-center">
          <ListPagination currentPage={page} totalPages={totalPages} />
        </div>
      </section>
    </>
  );
};
