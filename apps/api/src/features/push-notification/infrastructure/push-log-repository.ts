import { db } from '@repo/database';
import { desc, eq } from '@repo/database/orm';
import type { PushLogKind } from '@repo/database/schema';

type PublicPushLog = {
  id: number;
  kind: PushLogKind;
  title: string;
  body: string;
  url: string | null;
  sentAt: string;
};

type DeliveryCounts = {
  succeeded: number;
  failed: number;
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

// dedupeKey の unique 制約により、並行して実行されても履歴行を確保できるのは1実行だけ。
// 確保できなければ null を返す
export const claimPushLog = async (
  log: {
    kind: PushLogKind;
    title: string;
    body: string;
    url: string;
    dedupeKey: string;
  } & DeliveryCounts,
): Promise<number | null> => {
  const claimed = await db
    .insert(db._schema.pushLogs)
    .values(log)
    .onConflictDoNothing({ target: db._schema.pushLogs.dedupeKey })
    .returning({ id: db._schema.pushLogs.id });
  return claimed[0]?.id ?? null;
};

export const recordPushLogResult = async (
  id: number,
  counts: DeliveryCounts,
): Promise<void> => {
  await db
    .update(db._schema.pushLogs)
    .set(counts)
    .where(eq(db._schema.pushLogs.id, id));
};
