import { Suspense } from 'react';

import { ContentFallback, PageHeader } from '@/app/(authenticated)/_components';

import { ReportsContent } from './_components/reports-content/reports-content';

export default function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        description="Reporting APIから収集したブラウザレポート"
        title="レポート"
      />
      <Suspense fallback={<ContentFallback />}>
        <ReportsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
