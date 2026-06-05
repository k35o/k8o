import { Badge, Card } from '@k8o/arte-odyssey';
import { formatDate } from '@repo/helpers/date/format';
import type { FC } from 'react';

import { EmptyState } from '@/app/(authenticated)/_components';
import type { PushLogRecord } from '@/features/push-notification/interface/queries';

export const PushLogTable: FC<{ logs: PushLogRecord[] }> = ({ logs }) => {
  if (logs.length === 0) {
    return <EmptyState message="送信ログはありません" />;
  }

  return (
    <Card appearance="shadow">
      {logs.map((log) => (
        <div
          className="border-border-mute flex items-center gap-3 border-b px-5 py-4 text-sm last:border-b-0"
          key={log.id}
        >
          <Badge size="sm" text={log.kind} tone="neutral" />
          <span className="min-w-0 flex-1 truncate">{log.title}</span>
          <span className="text-fg-success hidden shrink-0 tabular-nums sm:block">
            成功 {log.succeeded}
          </span>
          <span className="text-fg-error hidden shrink-0 tabular-nums sm:block">
            失敗 {log.failed}
          </span>
          <span className="text-fg-mute hidden w-36 shrink-0 text-right text-xs sm:block">
            {formatDate(new Date(log.sentAt), 'yyyy/MM/dd HH:mm')}
          </span>
        </div>
      ))}
    </Card>
  );
};
