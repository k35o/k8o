import { db } from '@repo/database';
import { desc } from 'drizzle-orm';

export type PushLogKind = 'readings_updated' | 'baseline_updated';

// 公開する通知履歴。送信結果(succeeded/failed)は購読者数の露出につながるため含めない。
export type PublicPushLog = {
  id: number;
  kind: PushLogKind;
  title: string;
  body: string;
  url: string | null;
  sentAt: string;
};

export const findPushLogs = (limit: number): Promise<PublicPushLog[]> =>
  db.query.pushLogs.findMany({
    columns: {
      id: true,
      kind: true,
      title: true,
      body: true,
      url: true,
      sentAt: true,
    },
    orderBy: (logs) => [desc(logs.sentAt)],
    limit,
  });
