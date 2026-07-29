import {
  EmptyState,
  FilterSelect,
  ListPagination,
  SearchField,
  SectionHeader,
} from '@/app/(authenticated)/_components';
import {
  getBaselineFeatures,
  getBrowserSupportOverview,
} from '@/features/browser-support/interface/queries';
import type { BaselineSupportStatus } from '@/features/browser-support/interface/queries';
import { verifySession } from '@/shared/auth/verify-session';
import {
  firstParam,
  getTotalPages,
  parsePageParam,
} from '@/shared/search-params';

import { BaselineFeatureList } from '../baseline-feature-list';
import { BrowserSupportStats } from '../browser-support-stats';
import { SyncRunList } from '../sync-run-list';

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
  { value: 'all', label: 'すべて' },
  { value: 'newly', label: 'Newly' },
  { value: 'widely', label: 'Widely' },
  { value: 'limited', label: 'Limited' },
] as const;

const parseStatus = (
  value: string | undefined,
): BaselineSupportStatus | 'all' =>
  value === 'newly' || value === 'widely' || value === 'limited'
    ? value
    : 'all';

export const BrowserSupportContent = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  await verifySession();

  const sp = await searchParams;
  const status = parseStatus(firstParam(sp['status']));
  const q = firstParam(sp['q']) ?? '';
  const page = parsePageParam(firstParam(sp['page']));

  const [overview, { items, total }] = await Promise.all([
    getBrowserSupportOverview(),
    getBaselineFeatures({ status, q, page, pageSize: PAGE_SIZE }),
  ]);
  const totalPages = getTotalPages(total, PAGE_SIZE);

  return (
    <>
      {overview.active === null ? (
        <EmptyState message="データセットがまだありません。同期を実行してください" />
      ) : (
        <BrowserSupportStats active={overview.active} />
      )}

      <section className="flex flex-col gap-4">
        <SectionHeader title="機能一覧" />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchField placeholder="機能名・IDで検索" />
          <div className="sm:w-40">
            <FilterSelect
              label="ステータスで絞り込み"
              options={STATUS_OPTIONS}
              paramKey="status"
            />
          </div>
        </div>
        <BaselineFeatureList features={items} />
        <div className="flex justify-center">
          <ListPagination currentPage={page} totalPages={totalPages} />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeader title="同期履歴" />
        <SyncRunList runs={overview.runs} />
      </section>
    </>
  );
};
