'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { startTransition, useOptimistic, useState } from 'react';

import { paneHistoryStep, pinnedPaneAt, pushedInOf } from './pane-url';
import type { PinnedPane } from './pane-url';

// 再読み込みの前に積んだ記録へも同じ文書のまま戻れるが、Next はその記録にある前の文書の木で移動し直し、
// ページのデータを取りに行く。戻るで外すのをこの文書で積んだ記録に限るよう、文書ごとの鍵を印に入れる。
// 描画中に乱数を作らないよう、初めて書くときに作る
let documentKey: string | null = null;

const documentKeyOf = (): string => {
  documentKey ??= crypto.randomUUID();
  return documentKey;
};

const writePane = (next: PinnedPane | null): void => {
  const step = paneHistoryStep({
    href: window.location.href,
    pushedIn: pushedInOf(window.history.state),
    documentKey: documentKeyOf(),
    next,
  });
  if (step === null) {
    return;
  }
  if (step.type === 'back') {
    window.history.back();
    return;
  }
  if (step.type === 'push') {
    window.history.pushState(step.state, '', step.url);
  } else {
    window.history.replaceState(step.state, '', step.url);
  }
};

type PanePin = {
  pinned: PinnedPane | null;
  pin: (pane: PinnedPane) => void;
  unpin: () => void;
};

export const usePanePin = (ownPath: string): PanePin => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [kept, setKept] = useState(() =>
    pinnedPaneAt({ pathname, ownPath, searchParams, kept: null }),
  );
  const current = pinnedPaneAt({ pathname, ownPath, searchParams, kept });
  if (current !== kept) {
    setKept(current);
  }
  const [pinned, setOptimisticPinned] = useOptimistic(current);
  return {
    pinned,
    // URL はルーターの transition で描かれる。押したボタンが隠れたかでフォーカスを移せるよう、
    // flushSync の中で描かれる楽観的な値で先に出す
    pin: (pane) => {
      startTransition(() => {
        setOptimisticPinned(pane);
        writePane(pane);
      });
    },
    unpin: () => {
      writePane(null);
    },
  };
};
