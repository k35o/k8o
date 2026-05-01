import { verifySession } from '@/shared/auth/verify-session';

import { DashboardContent } from './_components/dashboard-content/dashboard-content';

export default async function Home() {
  await verifySession();
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-fg-mute mt-2 text-sm">k8o サイト全体の概況</p>
      </div>
      <DashboardContent />
    </div>
  );
}
