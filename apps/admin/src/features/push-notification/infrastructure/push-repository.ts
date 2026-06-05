import { db } from '@repo/database';
import { count, desc } from 'drizzle-orm';

export type HostCount = {
  host: string;
  count: number;
};

export type PushOverview = {
  subscriberCount: number;
  hostCounts: HostCount[];
  lastSentAt: string | null;
  lastSucceeded: number;
  lastFailed: number;
};

export type PushLogRecord = {
  id: number;
  kind: string;
  title: string;
  body: string;
  url: string | null;
  succeeded: number;
  failed: number;
  sentAt: string;
};

export type FindPushLogsParams = {
  page?: number;
  pageSize?: number;
};

export type FindPushLogsResult = {
  items: PushLogRecord[];
  total: number;
};

export const findPushOverview = async (): Promise<PushOverview> => {
  const [subscriberCount, hostRows, lastLog] = await Promise.all([
    db
      .select({ value: count() })
      .from(db._schema.pushSubscriptions)
      .then((r) => r[0]?.value ?? 0),
    db
      .select({
        host: db._schema.pushSubscriptions.endpointHost,
        value: count(),
      })
      .from(db._schema.pushSubscriptions)
      .groupBy(db._schema.pushSubscriptions.endpointHost)
      .orderBy(desc(count())),
    db
      .select({
        sentAt: db._schema.pushLogs.sentAt,
        succeeded: db._schema.pushLogs.succeeded,
        failed: db._schema.pushLogs.failed,
      })
      .from(db._schema.pushLogs)
      .orderBy(desc(db._schema.pushLogs.sentAt))
      .limit(1),
  ]);

  const last = lastLog[0];

  return {
    subscriberCount,
    hostCounts: hostRows.map((h) => ({ host: h.host, count: h.value })),
    lastSentAt: last?.sentAt ?? null,
    lastSucceeded: last?.succeeded ?? 0,
    lastFailed: last?.failed ?? 0,
  };
};

export const findPushLogs = async ({
  page = 1,
  pageSize = 20,
}: FindPushLogsParams = {}): Promise<FindPushLogsResult> => {
  const totalRow = await db
    .select({ value: count() })
    .from(db._schema.pushLogs);
  const total = totalRow[0]?.value ?? 0;

  const items = await db
    .select({
      id: db._schema.pushLogs.id,
      kind: db._schema.pushLogs.kind,
      title: db._schema.pushLogs.title,
      body: db._schema.pushLogs.body,
      url: db._schema.pushLogs.url,
      succeeded: db._schema.pushLogs.succeeded,
      failed: db._schema.pushLogs.failed,
      sentAt: db._schema.pushLogs.sentAt,
    })
    .from(db._schema.pushLogs)
    .orderBy(desc(db._schema.pushLogs.sentAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return { items, total };
};
