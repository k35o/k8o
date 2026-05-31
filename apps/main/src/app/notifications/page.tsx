import { Heading } from '@k8o/arte-odyssey';
import { range } from '@repo/helpers/array/range';
import { Suspense } from 'react';

import { NotificationHistory } from './_components/notification-history';
import { PushSubscribe } from './_components/push-subscribe';

const HistorySkeleton = () => (
  <ul className="flex flex-col gap-4">
    {range(0, 3).map((n) => (
      <li
        className="bg-bg-mute h-28 w-full animate-pulse rounded-xl"
        key={`history-skeleton-${n}`}
      />
    ))}
  </ul>
);

export default function Page() {
  const vapidPublicKey = process.env['VAPID_PUBLIC_KEY'] ?? '';

  return (
    <div className="flex flex-col gap-8">
      <PushSubscribe vapidPublicKey={vapidPublicKey} />
      <section className="flex flex-col gap-4">
        <Heading type="h3">通知履歴</Heading>
        <Suspense fallback={<HistorySkeleton />}>
          <NotificationHistory />
        </Suspense>
      </section>
    </div>
  );
}
