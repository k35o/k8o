import { Suspense } from 'react';
import { DashboardContent } from './_components/dashboard-content/dashboard-content';

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-bold text-2xl">Dashboard</h2>
        <p className="mt-2 text-fg-mute text-sm">k8o サイト全体の概況</p>
      </div>
      <Suspense
        fallback={<p className="text-fg-mute text-sm">読み込み中...</p>}
      >
        <DashboardContent />
      </Suspense>
    </div>
  );
}
