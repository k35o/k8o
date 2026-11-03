import { NotificationsIndex } from '@/components/notifications/notifications-index/notifications-index';
import { PageMeta } from '@/components/site/page-meta/page-meta';
import { getPushLogs } from '@/features/push-notification/interface/queries';

export default async function NotificationsPage() {
  const pushLogs = await getPushLogs();

  return (
    <>
      <PageMeta
        description="ReadingsとBrowser Supportの更新をプッシュ通知で受け取れます。受け取った通知の履歴も確認できます。"
        path="/notifications"
        title="通知"
      />
      <NotificationsIndex
        pushLogs={pushLogs}
        vapidPublicKey={process.env['VAPID_PUBLIC_KEY'] ?? ''}
      />
    </>
  );
}
