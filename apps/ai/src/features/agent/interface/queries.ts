import 'server-only';
import { headers } from 'next/headers';

import { requireAllowedSession } from '@/shared/auth/require-allowed-session';

import { listThreads, loadThread } from '../application/threads';
import type { LoadedThread, ThreadListItem } from '../application/threads';

export type { LoadedThread, ThreadListItem } from '../application/threads';

// 一覧が読めなくても、チャットそのものは使えるようにする
export const listThreadsForRoute = async (): Promise<ThreadListItem[]> => {
  const session = await requireAllowedSession(await headers());
  if (session === null) {
    return [];
  }
  try {
    return await listThreads({ userId: session.userId, now: Date.now() });
  } catch (error) {
    console.error('スレッドの一覧の取得に失敗しました', error);
    return [];
  }
};

export const loadThreadForRoute = async (
  threadId: string,
): Promise<LoadedThread | null> => {
  const session = await requireAllowedSession(await headers());
  if (session === null) {
    return null;
  }
  return loadThread({ threadId, userId: session.userId, now: Date.now() });
};
