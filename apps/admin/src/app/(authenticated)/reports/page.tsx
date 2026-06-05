import { PageHeader } from '@/app/(authenticated)/_components';
import { verifySession } from '@/shared/auth/verify-session';
import { parsePageParam } from '@/shared/search-params';

import { ReportsContent } from './_components/reports-content/reports-content';

const firstParam = (value: string | string[] | undefined): string | undefined =>
  typeof value === 'string' ? value : undefined;

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await verifySession();

  const sp = await searchParams;
  const type = firstParam(sp['type']) ?? '';
  const q = firstParam(sp['q']) ?? '';
  const page = parsePageParam(firstParam(sp['page']));

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        description="Reporting APIから収集したブラウザレポート"
        title="レポート"
      />
      <ReportsContent page={page} q={q} type={type} />
    </div>
  );
}
