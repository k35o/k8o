import { db } from '@repo/database';
import { desc } from '@repo/database/orm';
import type { PushLogKind } from '@repo/database/schema';

type PublicPushLog = {
  id: number;
  kind: PushLogKind;
  title: string;
  body: string;
  url: string | null;
  sentAt: string;
};

// 送信の成否（succeeded・failed）は購読者の数を明かすので返さない
export const findPublicPushLogs = (limit: number): Promise<PublicPushLog[]> =>
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
