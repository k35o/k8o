'use client';

import { useCallback } from 'react';

import { useBroadcastListener } from './use-broadcast-listener';
import { useHashIndex, writeHashIndex } from './use-hash-index';
import { toggleFullscreen, useIsFullscreen } from './use-is-fullscreen';
import { useIsHydrated } from './use-is-hydrated';
import { useKeyboardNav } from './use-keyboard-nav';

const clamp = (value: number, max: number) => Math.max(0, Math.min(value, max));

export const useDeckController = ({
  total,
  channelName,
}: {
  total: number;
  channelName: string;
}) => {
  const hashIndex = useHashIndex();
  const index = clamp(hashIndex, total - 1);

  const broadcast = useBroadcastListener({
    channelName,
    onReceive: (received) => {
      writeHashIndex(clamp(received, total - 1));
    },
  });

  const goTo = useCallback(
    (target: number) => {
      const clamped = clamp(target, total - 1);
      writeHashIndex(clamped);
      broadcast(clamped);
    },
    [total, broadcast],
  );

  const next = useCallback(() => {
    goTo(index + 1);
  }, [goTo, index]);

  const prev = useCallback(() => {
    goTo(index - 1);
  }, [goTo, index]);

  const first = useCallback(() => {
    goTo(0);
  }, [goTo]);

  const last = useCallback(() => {
    goTo(total - 1);
  }, [goTo, total]);

  useKeyboardNav({
    onNext: next,
    onPrev: prev,
    onFirst: first,
    onLast: last,
    onToggleFullscreen: toggleFullscreen,
  });

  const isFullscreen = useIsFullscreen();
  const isHydrated = useIsHydrated();

  return { index, goTo, next, prev, isFullscreen, isHydrated };
};
