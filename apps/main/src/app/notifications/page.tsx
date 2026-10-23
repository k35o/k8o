import { Heading } from '@k8ordo/ui';

import { getPushLogs } from '@/features/push-notification/interface/queries';

import { NotificationHistory } from './_components/notification-history';
import { PushSubscribe } from './_components/push-subscribe';

import styles from './page.module.css';

export default async function Page() {
  const vapidPublicKey = process.env['VAPID_PUBLIC_KEY'] ?? '';
  const pushLogs = await getPushLogs();

  return (
    <div className={styles.root}>
      <PushSubscribe vapidPublicKey={vapidPublicKey} />
      <section className={styles.history}>
        <Heading level="h3">通知履歴</Heading>
        <NotificationHistory pushLogs={pushLogs} />
      </section>
    </div>
  );
}
