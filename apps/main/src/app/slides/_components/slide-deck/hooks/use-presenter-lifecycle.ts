'use client';

import { useEffect } from 'react';

type HeartbeatMessage = { type: 'viewer-alive' };

const HEARTBEAT_INTERVAL_MS = 1500;
const HEARTBEAT_TIMEOUT_MS = 5000;

const lifecycleChannelName = (slug: string, sessionId: string): string =>
  `slides-lifecycle:${slug}:${sessionId}`;

const isHeartbeatMessage = (data: unknown): data is HeartbeatMessage => {
  if (typeof data !== 'object' || data === null) return false;
  return (data as { type?: unknown }).type === 'viewer-alive';
};

export const useBroadcastViewerHeartbeat = ({
  slug,
  sessionId,
}: {
  slug: string;
  sessionId: string;
}): void => {
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return undefined;
    if (sessionId === '') return undefined;
    const channel = new BroadcastChannel(lifecycleChannelName(slug, sessionId));
    const send = (): void => {
      // BroadcastChannel.postMessage は targetOrigin を取らない
      // oxlint-disable-next-line unicorn/require-post-message-target-origin
      channel.postMessage({ type: 'viewer-alive' } satisfies HeartbeatMessage);
    };
    send();
    const intervalId = window.setInterval(send, HEARTBEAT_INTERVAL_MS);
    return () => {
      window.clearInterval(intervalId);
      channel.close();
    };
  }, [slug, sessionId]);
};

export const useClosePresenterOnViewerStop = ({
  slug,
  sessionId,
}: {
  slug: string;
  sessionId: string;
}): void => {
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return undefined;
    if (sessionId === '') return undefined;
    const channel = new BroadcastChannel(lifecycleChannelName(slug, sessionId));
    let timeoutId: number | null = null;
    const resetTimer = (): void => {
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        window.close();
      }, HEARTBEAT_TIMEOUT_MS);
    };
    const handler = (event: MessageEvent<unknown>): void => {
      if (!isHeartbeatMessage(event.data)) return;
      resetTimer();
    };
    channel.addEventListener('message', handler);
    resetTimer();
    return () => {
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      channel.removeEventListener('message', handler);
      channel.close();
    };
  }, [slug, sessionId]);
};
