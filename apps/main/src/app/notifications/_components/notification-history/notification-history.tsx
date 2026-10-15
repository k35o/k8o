import { Anchor, Badge, Card } from '@k8ordo/ui';
import { formatDate } from '@repo/helpers/date/format';

import { getPushLogs } from '@/features/push-notification/interface/queries';

import styles from './notification-history.module.css';

type PushLog = Awaited<ReturnType<typeof getPushLogs>>[number];

const KIND_LABEL: Record<PushLog['kind'], string> = {
  readings_updated: 'Readings',
  browser_support_updated: 'Browser Support',
  browser_support_alert: 'Browser Support警報',
};

export const NotificationHistory = async () => {
  const logs = await getPushLogs();

  if (logs.length === 0) {
    return <p className={styles.empty}>まだ通知の履歴はありません。</p>;
  }

  return (
    <ul className={styles.list}>
      {logs.map((log) => (
        <li key={log.id}>
          <Card width="full" variant="outline">
            <div className={styles.item}>
              <div className={styles.meta}>
                <Badge label={KIND_LABEL[log.kind]} tone="info" />
                <time className={styles.time} dateTime={log.sentAt}>
                  {formatDate(new Date(log.sentAt), 'yyyy年M月d日(E) HH:mm')}
                </time>
              </div>
              <p className={styles.title}>{log.title}</p>
              <p className={styles.body}>{log.body}</p>
              {log.url !== null && <Anchor href={log.url}>{log.url}</Anchor>}
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
};
