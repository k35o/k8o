import { StatCard } from '@/app/(authenticated)/_components/stat-card/stat-card';
import { getBaselineSnapshotStats } from '@/features/baseline/interface/queries';

export const BaselineSnapshotStats = async () => {
  const { newlyCount, widelyCount, total } = await getBaselineSnapshotStats();

  return (
    <section className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      <StatCard label="Newly Available" value={String(newlyCount)} />
      <StatCard label="Widely Available" value={String(widelyCount)} />
      <StatCard label="合計" value={String(total)} />
    </section>
  );
};
