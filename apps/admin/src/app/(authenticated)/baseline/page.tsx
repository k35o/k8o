import { verifySession } from '@/libs/verify-session';
import { BaselineSnapshotStats } from './_components/baseline-snapshot-stats';
import { SyncBaselineButton } from './_components/sync-baseline-button';

export default async function BaselinePage() {
  await verifySession();
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-2xl">Baseline</h2>
          <p className="mt-2 text-fg-mute text-sm">
            Baselineスナップショットの管理
          </p>
        </div>
        <SyncBaselineButton />
      </div>
      <BaselineSnapshotStats />
    </div>
  );
}
