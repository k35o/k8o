'use client';

import { useCallback, useEffect, useRef } from 'react';

type ChannelMessage = { type: 'sync'; index: number };

const isChannelMessage = (data: unknown): data is ChannelMessage => {
  if (typeof data !== 'object' || data === null) return false;
  const record = data as Record<string, unknown>;
  return (
    record['type'] === 'sync' &&
    typeof record['index'] === 'number' &&
    Number.isInteger(record['index'])
  );
};

// 受信ペイロードは信頼境界の外なので shape を validation する。
export const useBroadcastListener = ({
  channelName,
  onReceive,
}: {
  channelName: string;
  onReceive: (index: number) => void;
}): ((index: number) => void) => {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const onReceiveRef = useRef(onReceive);
  onReceiveRef.current = onReceive;

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return undefined;
    const channel = new BroadcastChannel(channelName);
    channelRef.current = channel;
    const handler = (event: MessageEvent<unknown>) => {
      if (!isChannelMessage(event.data)) return;
      onReceiveRef.current(event.data.index);
    };
    channel.addEventListener('message', handler);
    return () => {
      channel.removeEventListener('message', handler);
      channel.close();
      channelRef.current = null;
    };
  }, [channelName]);

  return useCallback((index: number) => {
    const channel = channelRef.current;
    if (channel === null) return;
    // BroadcastChannel.postMessage は targetOrigin を取らない
    // oxlint-disable-next-line unicorn/require-post-message-target-origin
    channel.postMessage({ type: 'sync', index } satisfies ChannelMessage);
  }, []);
};
