'use client';

import { useEffect, useEffectEvent } from 'react';

import type { AgentUIMessage } from '@/features/agent/application/agent-message';
import type { ThreadSnapshot } from '@/features/agent/application/threads';

const SYNC_INTERVAL_MS = 2000;
// 送った直後に切れると、サーバーがスレッドを作る前に読むことがあるので、1回の 404 では諦めない
const MAX_NOT_FOUND = 5;

export const useThreadSync = ({
  threadId,
  enabled,
  onSettled,
}: {
  threadId: string;
  enabled: boolean;
  onSettled: (messages: AgentUIMessage[]) => void;
}): void => {
  const settle = useEffectEvent(onSettled);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let notFoundCount = 0;

    const poll = async (): Promise<void> => {
      try {
        const response = await fetch(`/api/chat/${threadId}`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (response.status === 404) {
          notFoundCount += 1;
          if (notFoundCount >= MAX_NOT_FOUND) {
            settle([]);
            return;
          }
        } else if (response.ok) {
          const snapshot = (await response.json()) as ThreadSnapshot;
          if (!snapshot.running) {
            settle(snapshot.messages);
            return;
          }
        }
      } catch {
        if (controller.signal.aborted) {
          return;
        }
      }
      timer = setTimeout(() => {
        void poll();
      }, SYNC_INTERVAL_MS);
    };

    void poll();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [enabled, threadId]);
};
