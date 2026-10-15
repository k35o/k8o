import 'server-only';
import { isGenerationModel } from '@/shared/claude/models';
import type { GenerationModel } from '@/shared/claude/models';

import {
  claimThreadRun,
  insertThreadMessage,
  insertThreadWithRun,
  markStopRequested,
  releaseThreadRun,
  selectThread,
  selectThreadMessages,
  selectThreadsByUser,
  updateLastInputTokens,
} from '../infrastructure/thread-repository';
import type { ThreadRow } from '../infrastructure/thread-repository';
import type { AgentUIMessage } from './agent-message';
import { heartbeatStaleBeforeIso, isRunActive } from './agent-run';

export type { ThreadRow } from '../infrastructure/thread-repository';

export type ThreadSnapshot =
  | { running: true }
  | { running: false; messages: AgentUIMessage[] };

export type ThreadListItem = {
  id: string;
  title: string;
  model: GenerationModel | null;
  updatedAt: string;
  running: boolean;
};

export type LoadedThread = {
  id: string;
  title: string;
  model: GenerationModel;
  running: boolean;
  messages: AgentUIMessage[];
};

const toIso = (time: number): string => new Date(time).toISOString();

export const findThread = async (threadId: string): Promise<ThreadRow | null> =>
  selectThread(threadId);

export const startRun = async (input: {
  thread: ThreadRow | null;
  threadId: string;
  userId: string;
  model: GenerationModel;
  title: string;
  runId: string;
  now: number;
}): Promise<boolean> =>
  input.thread === null
    ? insertThreadWithRun({
        id: input.threadId,
        userId: input.userId,
        title: input.title,
        model: input.model,
        runId: input.runId,
        heartbeatAt: toIso(input.now),
      })
    : claimThreadRun({
        threadId: input.threadId,
        userId: input.userId,
        runId: input.runId,
        heartbeatAt: toIso(input.now),
        staleBeforeIso: heartbeatStaleBeforeIso(input.now),
      });

export const releaseRun = async (input: {
  threadId: string;
  runId: string;
}): Promise<void> => {
  await releaseThreadRun(input);
};

// 返答を保存できなくても実行中の印は外したいので、2つの書き込みの失敗を別々に受け止める
export const finishRun = async (input: {
  threadId: string;
  runId: string;
  assistantMessage: AgentUIMessage;
}): Promise<void> => {
  try {
    await insertThreadMessage({
      threadId: input.threadId,
      message: input.assistantMessage,
    });
  } catch (error) {
    console.error('返答の保存に失敗しました', error);
  }
  try {
    await releaseThreadRun({ threadId: input.threadId, runId: input.runId });
  } catch (error) {
    console.error('実行中の印を外せませんでした', error);
  }
};

// 履歴はサーバーが書いたものなので検証しない。検証すると、tool のスキーマを変えたときに
// 古いスレッドを続けられなくなる
export const loadHistory = async (
  threadId: string,
): Promise<AgentUIMessage[]> =>
  (await selectThreadMessages(threadId)) as AgentUIMessage[];

export const appendMessage = async (input: {
  threadId: string;
  message: AgentUIMessage;
}): Promise<void> => {
  await insertThreadMessage(input);
};

export const recordInputTokens = async (input: {
  threadId: string;
  inputTokens: number;
}): Promise<void> => {
  await updateLastInputTokens(input);
};

const findOwnedThread = async (input: {
  threadId: string;
  userId: string;
}): Promise<ThreadRow | null> => {
  const thread = await selectThread(input.threadId);
  return thread?.userId === input.userId ? thread : null;
};

export const getThreadSnapshot = async (input: {
  threadId: string;
  userId: string;
  now: number;
}): Promise<ThreadSnapshot | null> => {
  const thread = await findOwnedThread(input);
  if (thread === null) {
    return null;
  }
  if (isRunActive(thread, input.now)) {
    return { running: true };
  }
  return { running: false, messages: await loadHistory(thread.id) };
};

export const listThreads = async (input: {
  userId: string;
  now: number;
}): Promise<ThreadListItem[]> =>
  (await selectThreadsByUser(input.userId)).map((thread) => ({
    id: thread.id,
    title: thread.title,
    model: isGenerationModel(thread.model) ? thread.model : null,
    updatedAt: thread.updatedAt,
    running: isRunActive(thread, input.now),
  }));

export const loadThread = async (input: {
  threadId: string;
  userId: string;
  now: number;
}): Promise<LoadedThread | null> => {
  const thread = await findOwnedThread(input);
  if (thread === null || !isGenerationModel(thread.model)) {
    return null;
  }
  return {
    id: thread.id,
    title: thread.title,
    model: thread.model,
    running: isRunActive(thread, input.now),
    messages: await loadHistory(thread.id),
  };
};

export const requestStop = async (input: {
  threadId: string;
  userId: string;
  now: number;
}): Promise<void> => {
  await markStopRequested({
    threadId: input.threadId,
    userId: input.userId,
    requestedAt: toIso(input.now),
  });
};
