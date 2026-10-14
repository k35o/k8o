import 'server-only';
import { db } from '@repo/ai-database';
import {
  and,
  asc,
  desc,
  eq,
  isNotNull,
  isNull,
  lt,
  or,
} from '@repo/ai-database/orm';

const threads = db._schema.aiThreads;
const threadMessages = db._schema.aiThreadMessages;

const THREAD_LIST_LIMIT = 100;

export type ThreadRow = {
  id: string;
  userId: string;
  title: string;
  model: string;
  runId: string | null;
  runHeartbeatAt: string | null;
  lastInputTokens: number | null;
  updatedAt: string;
};

const threadColumns = {
  id: threads.id,
  userId: threads.userId,
  title: threads.title,
  model: threads.model,
  runId: threads.runId,
  runHeartbeatAt: threads.runHeartbeatAt,
  lastInputTokens: threads.lastInputTokens,
  updatedAt: threads.updatedAt,
};

export const selectThread = async (
  threadId: string,
): Promise<ThreadRow | null> => {
  const [row] = await db
    .select(threadColumns)
    .from(threads)
    .where(eq(threads.id, threadId))
    .limit(1);
  return row ?? null;
};

export const selectThreadsByUser = async (
  userId: string,
): Promise<ThreadRow[]> =>
  db
    .select(threadColumns)
    .from(threads)
    .where(eq(threads.userId, userId))
    .orderBy(desc(threads.updatedAt))
    .limit(THREAD_LIST_LIMIT);

export const insertThreadWithRun = async (input: {
  id: string;
  userId: string;
  title: string;
  model: string;
  runId: string;
  heartbeatAt: string;
}): Promise<boolean> => {
  const rows = await db
    .insert(threads)
    .values({
      id: input.id,
      userId: input.userId,
      title: input.title,
      model: input.model,
      runId: input.runId,
      runHeartbeatAt: input.heartbeatAt,
    })
    .onConflictDoNothing()
    .returning({ id: threads.id });
  return rows.length > 0;
};

// 読んでから書くと、同時に来た2つの要求がどちらも空いていると見て取れてしまうので、
// 空いているかの確認と実行中の印を付けるのを1文で行う
export const claimThreadRun = async (input: {
  threadId: string;
  userId: string;
  runId: string;
  heartbeatAt: string;
  staleBeforeIso: string;
}): Promise<boolean> => {
  const rows = await db
    .update(threads)
    .set({
      runId: input.runId,
      runHeartbeatAt: input.heartbeatAt,
      stopRequestedAt: null,
    })
    .where(
      and(
        eq(threads.id, input.threadId),
        eq(threads.userId, input.userId),
        or(
          isNull(threads.runId),
          lt(threads.runHeartbeatAt, input.staleBeforeIso),
        ),
      ),
    )
    .returning({ id: threads.id });
  return rows.length > 0;
};

export const touchRunHeartbeat = async (input: {
  threadId: string;
  runId: string;
  heartbeatAt: string;
}): Promise<{ stopRequested: boolean } | null> => {
  const [row] = await db
    .update(threads)
    .set({ runHeartbeatAt: input.heartbeatAt })
    .where(and(eq(threads.id, input.threadId), eq(threads.runId, input.runId)))
    .returning({ stopRequestedAt: threads.stopRequestedAt });
  return row === undefined
    ? null
    : { stopRequested: row.stopRequestedAt !== null };
};

export const releaseThreadRun = async (input: {
  threadId: string;
  runId: string;
}): Promise<void> => {
  await db
    .update(threads)
    .set({ runId: null, runHeartbeatAt: null, stopRequestedAt: null })
    .where(and(eq(threads.id, input.threadId), eq(threads.runId, input.runId)));
};

export const markStopRequested = async (input: {
  threadId: string;
  userId: string;
  requestedAt: string;
}): Promise<void> => {
  await db
    .update(threads)
    .set({ stopRequestedAt: input.requestedAt })
    .where(
      and(
        eq(threads.id, input.threadId),
        eq(threads.userId, input.userId),
        isNotNull(threads.runId),
      ),
    );
};

export const updateLastInputTokens = async (input: {
  threadId: string;
  inputTokens: number;
}): Promise<void> => {
  await db
    .update(threads)
    .set({ lastInputTokens: input.inputTokens })
    .where(eq(threads.id, input.threadId));
};

export const selectThreadMessages = async (
  threadId: string,
): Promise<unknown[]> => {
  const rows = await db
    .select({ message: threadMessages.message })
    .from(threadMessages)
    .where(eq(threadMessages.threadId, threadId))
    .orderBy(asc(threadMessages.id));
  return rows.map((row) => row.message);
};

export const insertThreadMessage = async (input: {
  threadId: string;
  message: unknown;
}): Promise<void> => {
  await db
    .insert(threadMessages)
    .values({ threadId: input.threadId, message: input.message });
};
