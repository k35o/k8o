import { Suspense } from 'react';

import { ContentFallback, PageHeader } from '@/app/(authenticated)/_components';

import { NotificationsContent } from './_components/notifications-content/notifications-content';

export default function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        description="Web Push の購読状況と送信ログを確認し、手動送信します。"
        title="通知"
      />
      <Suspense fallback={<ContentFallback />}>
        <NotificationsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
