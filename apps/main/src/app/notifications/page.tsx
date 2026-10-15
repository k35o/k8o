import { Heading } from '@k8ordo/ui';
import { range } from '@repo/helpers/array/range';
import { Suspense } from 'react';

import { NotificationHistory } from './_components/notification-history';
import { PushSubscribe } from './_components/push-subscribe';

import styles from './page.module.css';

const HistorySkeleton = () => (
  <ul className={styles.skeleton}>
    {range(0, 3).map((n) => (
      <li className={styles.skeletonItem} key={`history-skeleton-${n}`} />
    ))}
  </ul>
);

export default function Page() {
  const vapidPublicKey = process.env['VAPID_PUBLIC_KEY'] ?? '';

  return (
    <div className={styles.root}>
      <PushSubscribe vapidPublicKey={vapidPublicKey} />
      <section className={styles.history}>
        <Heading level="h3">通知履歴</Heading>
        <Suspense fallback={<HistorySkeleton />}>
          <NotificationHistory />
        </Suspense>
      </section>
    </div>
  );
}
