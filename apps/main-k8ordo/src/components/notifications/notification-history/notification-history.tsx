'use client';

import { Anchor, Badge, Card } from '@k8ordo/ui';
import { formatDate } from '@repo/helpers/date/format';
import type { FC } from 'react';

import type { PushLogs } from '@/features/push-notification/interface/queries';
import { useLiveSnapshot } from '@/shared/api/live-snapshot';
import { publicApi, readOrNull } from '@/shared/api/public-api';

import styles from './notification-history.module.css';

type PushLog = PushLogs['logs'][number];

const KIND_LABEL: Record<PushLog['kind'], string> = {
  readings_updated: 'Readings',
  browser_support_updated: 'Browser Support',
  browser_support_alert: 'Browser Support警報',
};

const loadPushLogs = (): Promise<PushLogs | null> =>
  readOrNull(publicApi.public['push-logs'].$get());

export const NotificationHistory: FC<{ pushLogs: PushLogs }> = ({
  pushLogs,
}) => {
  const { logs } = useLiveSnapshot('push-logs', loadPushLogs, pushLogs);

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
