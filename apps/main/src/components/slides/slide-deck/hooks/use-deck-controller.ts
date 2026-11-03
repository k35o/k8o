'use client';

import { useCallback, useState } from 'react';

import { useBroadcastListener } from './use-broadcast-listener';
import { useHashIndex, writeHashIndex } from './use-hash-index';
import { toggleFullscreen, useIsFullscreen } from './use-is-fullscreen';
import { useKeyboardNav } from './use-keyboard-nav';

const clamp = (value: number, max: number) => Math.max(0, Math.min(value, max));

// router は移る先の URL を先に書き、着くまで前のページを残す。#<番号> は @k8ordo/state を通さずに読み書き
// するので、そのあいだに書くと移る先の URL に付き、進んでいる遷移を中断して読み直させる。だから、デッキを
// 開いたときの pathname を離れたら、番号を最後に読んだ値で止めて（useHashIndex）何も書かず、この画面に
// 出せない番号をほかのタブへも送らない
export const useDeckController = ({
  total,
  channelName,
}: {
  total: number;
  channelName: string;
}) => {
  // oxlint-disable-next-line react/hook-use-state -- 初期化時に一度だけ算出する安定値で setter は不要
  const [deckPathname] = useState(() => window.location.pathname);
  const hashIndex = useHashIndex(deckPathname);
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
