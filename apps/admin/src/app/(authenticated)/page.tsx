import { verifySession } from '@/shared/auth/verify-session';
import { DashboardContent } from './_components/dashboard-content/dashboard-content';

export default async function Home() {
  await verifySession();
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-bold text-2xl">Dashboard</h2>
        <p className="mt-2 text-fg-mute text-sm">k8o サイト全体の概況</p>
      </div>
      <DashboardContent />
    </div>
  );
}
