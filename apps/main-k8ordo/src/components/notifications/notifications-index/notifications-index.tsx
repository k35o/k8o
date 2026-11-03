import { Heading } from '@k8ordo/ui';
import type { FC } from 'react';

import type { PushLogs } from '@/features/push-notification/interface/queries';

import { NotificationHistory } from '../notification-history/notification-history';
import { PushSubscribe } from '../push-subscribe/push-subscribe';

import styles from './notifications-index.module.css';

export const NotificationsIndex: FC<{
  vapidPublicKey: string;
  pushLogs: PushLogs;
}> = ({ vapidPublicKey, pushLogs }) => (
  <div className={styles.root}>
    <div className={styles.content}>
      <Heading level="h2">通知</Heading>
      <div className={styles.section}>
        <PushSubscribe vapidPublicKey={vapidPublicKey} />
        <section className={styles.history}>
          <Heading level="h3">通知履歴</Heading>
          <NotificationHistory pushLogs={pushLogs} />
        </section>
      </div>
    </div>
  </div>
);
