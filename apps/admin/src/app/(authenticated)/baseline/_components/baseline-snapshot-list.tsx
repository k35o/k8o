import { Badge, Card } from '@k8o/arte-odyssey';
import { formatDate } from '@repo/helpers/date/format';
import type { FC } from 'react';

import { EmptyState } from '@/app/(authenticated)/_components';
import type { BaselineSnapshotRecord } from '@/features/baseline/interface/queries';

export const BaselineSnapshotList: FC<{
  snapshots: BaselineSnapshotRecord[];
}> = ({ snapshots }) => {
  if (snapshots.length === 0) {
    return <EmptyState message="条件に一致するスナップショットはありません" />;
  }

  return (
    <Card appearance="shadow">
      {snapshots.map((snapshot) => (
        <div
          className="border-border-mute flex items-center gap-3 border-b px-5 py-4 text-sm last:border-b-0"
          key={snapshot.id}
        >
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate font-medium">{snapshot.name}</span>
            <span className="text-fg-mute truncate text-xs">
              {snapshot.featureId}
            </span>
          </div>
          <Badge
            size="sm"
            text={snapshot.status === 'newly' ? 'Newly' : 'Widely'}
            tone={snapshot.status === 'newly' ? 'info' : 'success'}
          />
          <span className="text-fg-mute hidden w-28 shrink-0 text-right text-xs sm:block">
            {formatDate(new Date(snapshot.date))}
          </span>
        </div>
      ))}
    </Card>
  );
};
