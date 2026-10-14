'use client';

import { useEffect, useEffectEvent } from 'react';

import type {
  AgentUIMessage,
  ServerSync,
} from '@/features/agent/application/agent-message';
import type { ThreadSnapshot } from '@/features/agent/application/threads';

const SYNC_INTERVAL_MS = 2000;
// 送った直後に切れると、サーバーがスレッドを作る前に読むことがあるので、1回の 404 では諦めない
const MAX_NOT_FOUND = 5;

// 'wait' はサーバーの生成が終わるまで読み続け、'check' は1回だけ読んで生成中なら 'wait' に移る。
// onSettled の null は、読めないまま諦めたこと（今のメッセージをそのまま残す）を表す
export const useThreadSync = ({
  threadId,
  mode,
  onSettled,
  onRunning,
}: {
  threadId: string;
  mode: ServerSync | null;
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
      try {
        const response = await fetch(`/api/chat/${threadId}`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (response.status === 401) {
          settle(null);
          return;
        }
        if (response.status === 404) {
          notFoundCount += 1;
          if (mode === 'check' || notFoundCount >= MAX_NOT_FOUND) {
            settle([]);
            return;
          }
        } else if (response.ok) {
          const snapshot = (await response.json()) as ThreadSnapshot;
          if (!snapshot.running) {
            settle(snapshot.messages);
            return;
          }
          if (mode === 'check') {
            wait();
            return;
          }
        } else if (mode === 'check') {
          wait();
          return;
        }
      } catch {
        if (controller.signal.aborted) {
          return;
        }
        if (mode === 'check') {
          wait();
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
  }, [mode, threadId]);
};
