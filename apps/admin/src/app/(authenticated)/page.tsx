import { PageHeader } from '@/app/(authenticated)/_components/page-header';
import { verifySession } from '@/shared/auth/verify-session';

import { DashboardContent } from './_components/dashboard-content/dashboard-content';

export default async function Home() {
  await verifySession();
  return (
    <div className="flex flex-col gap-10">
      <PageHeader description="k8o サイト全体の概況" title="ダッシュボード" />
      <DashboardContent />
    </div>
  );
}
