import { Anchor, Badge, Card } from '@k8ordo/ui';
import { formatDate } from '@repo/helpers/date/format';

import { getPushLogs } from '@/features/push-notification/interface/queries';

type PushLog = Awaited<ReturnType<typeof getPushLogs>>[number];

const KIND_LABEL: Record<PushLog['kind'], string> = {
  readings_updated: 'Readings',
  browser_support_updated: 'Browser Support',
  browser_support_alert: 'Browser Support警報',
};

export const NotificationHistory = async () => {
  const logs = await getPushLogs();

  if (logs.length === 0) {
    return <p className="text-fg-mute text-sm">まだ通知の履歴はありません。</p>;
  }

  return (
    <ul className="flex flex-col gap-4">
      {logs.map((log) => (
        <li key={log.id}>
          <Card width="full" variant="outline">
            <div className="flex flex-col gap-2 p-4">
              <div className="flex items-center gap-2">
                <Badge label={KIND_LABEL[log.kind]} tone="info" />
                <time className="text-fg-mute text-xs" dateTime={log.sentAt}>
                  {formatDate(new Date(log.sentAt), 'yyyy年M月d日(E) HH:mm')}
                </time>
              </div>
              <p className="text-fg-base font-bold">{log.title}</p>
              <p className="text-fg-base text-sm">{log.body}</p>
              {log.url !== null && <Anchor href={log.url}>{log.url}</Anchor>}
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
};
