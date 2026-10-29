'use client';

import { useCallback } from 'react';

import { useBroadcastListener } from './use-broadcast-listener';
import { useHashIndex, writeHashIndex } from './use-hash-index';
import { toggleFullscreen, useIsFullscreen } from './use-is-fullscreen';
import { useKeyboardNav } from './use-keyboard-nav';

const clamp = (value: number, max: number) => Math.max(0, Math.min(value, max));

// router は移る先の URL を先に書き、着くまで前のページを残す。そのあいだに書くと、移る先の URL に
// #<番号> が付き、進んでいる遷移を中断して読み直させる。そのあいだの番号は移る先の URL から読んだもので、
// 送るとほかのタブを引き戻す。だから、デッキを開いたときの pathname を離れたら書きも送りもしない
export const useDeckController = ({
  total,
  channelName,
  deckPathname,
}: {
  total: number;
  channelName: string;
  deckPathname: string;
}) => {
  const hashIndex = useHashIndex();
  const index = clamp(hashIndex, total - 1);

  const broadcast = useBroadcastListener({
    channelName,
    onReceive: (received) => {
      if (window.location.pathname !== deckPathname) return;
      writeHashIndex(clamp(received, total - 1));
    },
  });

  const goTo = useCallback(
    (target: number) => {
      if (window.location.pathname !== deckPathname) return;
      const clamped = clamp(target, total - 1);
      writeHashIndex(clamped);
      broadcast(clamped);
    },
    [total, broadcast, deckPathname],
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

  return { index, goTo, next, prev, isFullscreen };
};
