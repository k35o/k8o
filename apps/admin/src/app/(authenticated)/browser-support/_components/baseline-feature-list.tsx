import { Badge, Card } from '@k8o/arte-odyssey';
import { formatDate } from '@repo/helpers/date/format';
import type { FC } from 'react';

import { EmptyState } from '@/app/(authenticated)/_components';
import type {
  BaselineFeature,
  BaselineSupportStatus,
} from '@/features/browser-support/interface/queries';

const STATUS_META: Record<
  BaselineSupportStatus,
  { label: string; tone: 'success' | 'info' | 'warning' }
> = {
  widely: { label: 'Widely', tone: 'success' },
  newly: { label: 'Newly', tone: 'info' },
  limited: { label: 'Limited', tone: 'warning' },
};

export const BaselineFeatureList: FC<{
  features: BaselineFeature[];
}> = ({ features }) => {
  if (features.length === 0) {
    return <EmptyState message="条件に一致する機能はありません" />;
  }

  return (
    <Card appearance="shadow">
      {features.map((feature) => {
        const meta = STATUS_META[feature.status];
        return (
          <div
            className="border-border-mute flex items-center gap-3 border-b px-5 py-4 text-sm last:border-b-0"
            key={feature.featureId}
          >
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-medium">{feature.name}</span>
              <span className="text-fg-mute truncate text-xs">
                {feature.featureId}
              </span>
            </div>
            <Badge size="sm" text={meta.label} tone={meta.tone} />
            <span className="text-fg-mute hidden w-28 shrink-0 text-right text-xs sm:block">
              {feature.resolvedDate === ''
                ? '-'
                : formatDate(new Date(feature.resolvedDate))}
            </span>
          </div>
        );
      })}
    </Card>
  );
};
