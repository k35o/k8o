import { Card, HistoryIcon, SendIcon, SubscribeIcon } from '@k8o/arte-odyssey';
import { formatDate } from '@repo/helpers/date/format';

import {
  ListPagination,
  PageHeader,
  SectionHeader,
  StatCard,
} from '@/app/(authenticated)/_components';
import {
  getPushLogs,
  getPushOverview,
} from '@/features/push-notification/interface/queries';
import { verifySession } from '@/shared/auth/verify-session';
import { getTotalPages, parsePageParam } from '@/shared/search-params';

import { PushLogTable } from './_components/push-log-table';
import { PushSendForm } from './_components/push-send-form';

const PAGE_SIZE = 20;

const firstParam = (value: string | string[] | undefined): string | undefined =>
  typeof value === 'string' ? value : undefined;

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await verifySession();

  const sp = await searchParams;
  const page = parsePageParam(firstParam(sp['page']));

  const [overview, { items, total }] = await Promise.all([
    getPushOverview(),
    getPushLogs({ page, pageSize: PAGE_SIZE }),
  ]);
  const totalPages = getTotalPages(total, PAGE_SIZE);

  const lastSentLabel =
    overview.lastSentAt === null
      ? '送信履歴なし'
      : `直近: ${formatDate(new Date(overview.lastSentAt), 'yyyy/MM/dd HH:mm')}`;

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        description="Web Push の購読状況と送信ログを確認し、手動送信します。"
        title="通知"
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatCard
          description={`${String(overview.hostCounts.length)} ホスト`}
          icon={<SubscribeIcon size="md" />}
          label="購読者数"
          value={String(overview.subscriberCount)}
        />
        <StatCard
          description={`失敗 ${String(overview.lastFailed)}・${lastSentLabel}`}
          icon={<SendIcon size="md" />}
          label="直近の送信成功"
          value={String(overview.lastSucceeded)}
        />
        <StatCard
          icon={<HistoryIcon size="md" />}
          label="送信ログ件数"
          value={String(total)}
        />
      </div>

      {overview.hostCounts.length > 0 && (
        <section className="flex flex-col gap-4">
          <SectionHeader title="購読ホスト" />
          <Card appearance="shadow">
            {overview.hostCounts.map((host) => (
              <div
                className="border-border-mute flex items-center justify-between gap-3 border-b px-5 py-3 text-sm last:border-b-0"
                key={host.host}
              >
                <span className="min-w-0 truncate">{host.host}</span>
                <span className="text-fg-mute shrink-0 tabular-nums">
                  {host.count}
                </span>
              </div>
            ))}
          </Card>
        </section>
      )}

      <section className="flex flex-col gap-4">
        <SectionHeader title="手動送信" />
        <PushSendForm />
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeader title="送信ログ" />
        <PushLogTable logs={items} />
        <div className="flex justify-center">
          <ListPagination currentPage={page} totalPages={totalPages} />
        </div>
      </section>
    </div>
  );
}
