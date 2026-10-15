'use client';

import { useEffect, useEffectEvent } from 'react';

import type { AgentUIMessage } from '@/features/agent/application/agent-message';
import {
  nextSyncStep,
  syncRetryDelayMs,
} from '@/features/agent/application/thread-sync';
import type {
  ServerSync,
  ThreadRead,
} from '@/features/agent/application/thread-sync';
import type { ThreadSnapshot } from '@/features/agent/application/threads';

const readThread = async (
  threadId: string,
  notFoundCount: number,
  signal: AbortSignal,
): Promise<ThreadRead | null> => {
  try {
    const response = await fetch(`/api/chat/${threadId}`, {
      cache: 'no-store',
      signal,
    });
    if (response.status === 401) {
      return { type: 'unauthorized' };
    }
    if (response.status === 404) {
      return { type: 'not-found', count: notFoundCount + 1 };
    }
    if (!response.ok) {
      return { type: 'failed' };
    }
    return {
      type: 'snapshot',
      snapshot: (await response.json()) as ThreadSnapshot,
    };
  } catch {
    return signal.aborted ? null : { type: 'failed' };
  }
};

export const useThreadSync = ({
  threadId,
  mode,
  stopSent,
  onSettled,
  onRunning,
}: {
  threadId: string;
  mode: ServerSync | null;
  stopSent: boolean;
  onSettled: (messages: AgentUIMessage[] | null) => void;
  onRunning: () => void;
}): void => {
  const settle = useEffectEvent(onSettled);
  const wait = useEffectEvent(onRunning);

  useEffect(() => {
    if (mode === null) {
      return;
    }
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let notFoundCount = 0;

    const poll = async (): Promise<void> => {
      const read = await readThread(threadId, notFoundCount, controller.signal);
      if (read === null) {
        return;
      }
      if (read.type === 'not-found') {
        notFoundCount = read.count;
      }
      const step = nextSyncStep(mode, read);
      switch (step.type) {
        case 'settle':
          settle(step.messages);
          return;
        case 'wait':
          wait();
          return;
        case 'retry':
          timer = setTimeout(() => {
            void poll();
          }, syncRetryDelayMs({ stopSent, read }));
      }
    };

    void poll();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [mode, threadId, stopSent]);
};
