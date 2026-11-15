'use client';

import { useAppState } from '@k8ordo/state';
import { between } from '@repo/helpers/number/between';
import { useCallback, useState } from 'react';

import {
  slideDeckState,
  slideHashOf,
  slideIndexOf,
} from '../slide-deck/deck-state';
import { useBroadcastListener } from './use-broadcast-listener';
import { toggleFullscreen } from './use-is-fullscreen';
import { useKeyboardNav } from './use-keyboard-nav';

// router は移る先の URL を先に書き、着くまで前のページを残す。そのあいだ state は開いたときの URL の値を
// 返し、update() は何も書かない。ほかのタブへの知らせは state を通らないので、デッキを開いたときの pathname を
// 離れたら、この画面に出せない番号を送らない
export const useDeckController = ({
  total,
  channelName,
}: {
  total: number;
  channelName: string;
}) => {
  // oxlint-disable-next-line react/hook-use-state -- 初期化時に一度だけ算出する安定値で setter は不要
  const [deckPathname] = useState(() => window.location.pathname);
  const [{ hash }, update] = useAppState(slideDeckState, ['hash']);
  const index = between(slideIndexOf(hash), 0, total - 1);

  const broadcast = useBroadcastListener({
    channelName,
    onReceive: (received) => {
      update({ hash: slideHashOf(between(received, 0, total - 1)) });
    },
  });

  const goTo = useCallback(
    (target: number) => {
      if (window.location.pathname !== deckPathname) return;
      const clamped = between(target, 0, total - 1);
      update({ hash: slideHashOf(clamped) });
      broadcast(clamped);
    },
    [total, broadcast, deckPathname, update],
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

  return { index, next, prev };
};
