import { ShieldCheckIcon, SparklesIcon, TableIcon } from '@k8ordo/ui';
import { formatDate } from '@repo/helpers/date/format';
import type { FC } from 'react';

import { StatCard } from '@/app/(authenticated)/_components/stat-card';
import type { BrowserSupportOverview } from '@/features/browser-support/interface/queries';

export const BrowserSupportStats: FC<{
  active: NonNullable<BrowserSupportOverview['active']>;
}> = ({ active }) => (
  <section className="flex flex-col gap-3">
    <p className="text-fg-mute text-sm">
      データ基準: web-features v{active.upstreamVersion}（
      {formatDate(new Date(active.ingestedAt))} 取り込み）
    </p>
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      <StatCard
        icon={<SparklesIcon size="md" />}
        label="Newly Available"
        value={String(active.newlyCount)}
      />
      <StatCard
        icon={<ShieldCheckIcon size="md" />}
        label="Widely Available"
        value={String(active.widelyCount)}
      />
      <StatCard
        icon={<TableIcon size="md" />}
        label="合計"
        value={String(active.total)}
      />
    </div>
  </section>
);
