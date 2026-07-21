import { ShieldCheckIcon, SparklesIcon, TableIcon } from '@k8o/arte-odyssey';

import { StatCard } from '@/app/(authenticated)/_components/stat-card';
import { getSnapshotStats } from '@/features/browser-support/interface/queries';

export const SnapshotStats = async () => {
  const { newlyCount, widelyCount, total } = await getSnapshotStats();

  return (
    <section className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      <StatCard
        icon={<SparklesIcon size="md" />}
        label="Newly Available"
        value={String(newlyCount)}
      />
      <StatCard
        icon={<ShieldCheckIcon size="md" />}
        label="Widely Available"
        value={String(widelyCount)}
      />
      <StatCard
        icon={<TableIcon size="md" />}
        label="合計"
        value={String(total)}
      />
    </section>
  );
};
