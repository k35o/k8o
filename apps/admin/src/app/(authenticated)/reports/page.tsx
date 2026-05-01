import { verifySession } from '@/libs/verify-session';

import { ReportsContent } from './_components/reports-content/reports-content';

export default async function ReportsPage() {
  await verifySession();
  return (
    <div className="flex flex-col gap-10">
      <div>
        <h2 className="text-2xl font-bold">レポート</h2>
        <p className="text-fg-mute mt-2 text-sm">
          Reporting APIから収集したブラウザレポート
        </p>
      </div>
      <ReportsContent />
    </div>
  );
}
