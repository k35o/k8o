import { Suspense } from 'react';

import { ContentFallback, PageHeader } from '@/app/(authenticated)/_components';

import { BaselineContent } from './_components/baseline-content/baseline-content';
import { SyncBaselineButton } from './_components/sync-baseline-button';

export default function BaselinePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        action={<SyncBaselineButton />}
        description="Baselineスナップショットの管理"
        title="Baseline"
      />
      <Suspense fallback={<ContentFallback />}>
        <BaselineContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
