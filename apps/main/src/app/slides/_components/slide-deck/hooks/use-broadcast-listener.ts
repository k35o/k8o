'use client';

import { useEffect, useRef } from 'react';

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

/**
 * BroadcastChannel を購読し、受信時に `onReceive` を呼ぶ。
 * 戻り値の `broadcast` 関数で送信する (event handler から呼ぶ想定)。
 *
 * 外部システム (BroadcastChannel) の購読は useEffect の正当な用途。
 * 送信は event handler に任せて、state→送信の useEffect は持たない。
 *
 * 受信ペイロードは信頼境界の外なので shape を validation する。
 */
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

  return (index: number) => {
    const channel = channelRef.current;
    if (channel === null) return;
    // BroadcastChannel.postMessage は targetOrigin を取らない
    // oxlint-disable-next-line unicorn/require-post-message-target-origin
    channel.postMessage({ type: 'sync', index } satisfies ChannelMessage);
  };
};
