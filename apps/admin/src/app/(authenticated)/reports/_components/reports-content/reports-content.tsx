import { TableIcon } from '@k8o/arte-odyssey';

import {
  FilterSelect,
  ListPagination,
  SearchField,
  SectionHeader,
  StatCard,
} from '@/app/(authenticated)/_components';
import {
  getReports,
  getReportTypeCounts,
} from '@/features/reports/interface/queries';
import { verifySession } from '@/shared/auth/verify-session';
import {
  firstParam,
  getTotalPages,
  parsePageParam,
} from '@/shared/search-params';

import { ReportTable } from '../report-table/report-table';

const PAGE_SIZE = 20;

export const ReportsContent = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  await verifySession();

  const sp = await searchParams;
  const type = firstParam(sp['type']) ?? '';
  const q = firstParam(sp['q']) ?? '';
  const page = parsePageParam(firstParam(sp['page']));

  const [{ typeCounts, totalCount }, { items, total }] = await Promise.all([
    getReportTypeCounts(),
    getReports({ type, q, page, pageSize: PAGE_SIZE }),
  ]);
  const totalPages = getTotalPages(total, PAGE_SIZE);

  const typeOptions = [
    { value: '', label: 'すべての種別' },
    ...typeCounts.map((t) => ({
      value: t.type,
      label: `${t.type} (${String(t.count)})`,
    })),
  ];

  return (
    <div className="flex flex-col gap-10">
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatCard
          icon={<TableIcon size="md" />}
          label="総レポート数"
          value={String(totalCount)}
        />
        {typeCounts.map((t) => (
          <StatCard key={t.type} label={t.type} value={String(t.count)} />
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeader title="レポート一覧" />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchField placeholder="URL で検索" />
          <div className="sm:w-56">
            <FilterSelect
              label="種別で絞り込み"
              options={typeOptions}
              paramKey="type"
            />
          </div>
        </div>
        <ReportTable reports={items} />
        <div className="flex justify-center">
          <ListPagination currentPage={page} totalPages={totalPages} />
        </div>
      </section>
    </div>
  );
};
