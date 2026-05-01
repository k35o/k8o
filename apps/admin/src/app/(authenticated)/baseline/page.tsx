import { verifySession } from '@/shared/auth/verify-session';

import { BaselineSnapshotStats } from './_components/baseline-snapshot-stats';
import { SyncBaselineButton } from './_components/sync-baseline-button';

export default async function BaselinePage() {
  await verifySession();
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Baseline</h2>
          <p className="text-fg-mute mt-2 text-sm">
            Baselineスナップショットの管理
          </p>
        </div>
        <SyncBaselineButton />
      </div>
      <BaselineSnapshotStats />
    </div>
  );
}
