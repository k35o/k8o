import { Suspense } from 'react';

import { ContentFallback, PageHeader } from '@/app/(authenticated)/_components';

import { DashboardContent } from './_components/dashboard-content/dashboard-content';

export default function Home() {
  return (
    <div className="flex flex-col gap-10">
      <PageHeader description="k8o サイト全体の概況" title="ダッシュボード" />
      <Suspense fallback={<ContentFallback />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
