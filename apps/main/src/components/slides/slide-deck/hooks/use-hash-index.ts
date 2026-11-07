'use client';

import { useCallback, useState, useSyncExternalStore } from 'react';
import type { RefCallback } from 'react';

const HASH_INDEX_RE = /^#(\d+)$/u;

const subscribe = (callback: () => void): (() => void) => {
  window.addEventListener('hashchange', callback);
  return () => {
    window.removeEventListener('hashchange', callback);
  };
};

const readHashIndex = (): number => {
  const match = HASH_INDEX_RE.exec(window.location.hash);
  if (match === null) return 0;
  const value = Number(match[1] ?? '');
  return Number.isInteger(value) ? Math.max(0, value - 1) : 0;
};

const getServerSnapshot = (): number => 0;

// デッキを開いた pathname を離れたあとの URL は移る先のもので、描き直すとその hash を読んでしまうので、
// 最後に読んだ番号を返す
export const useHashIndex = (deckPathname: string): number => {
  // oxlint-disable-next-line react/hook-use-state -- 初期化時に一度だけ作るストアで setter は不要
  const [getSnapshot] = useState(() => {
    let last = readHashIndex();
    return (): number => {
      if (window.location.pathname === deckPathname) last = readHashIndex();
      return last;
    };
  });
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};

// デッキは画面を覆うので、番号でない fragment の先（スキップリンクの main など）はどれもデッキの下に隠れる。
// その hash に移すと番号が消えて 1 枚目に戻るので、移動を止め、渡された要素（デッキ）にフォーカスを移す。
// 戻る・進むは止めると履歴を動かせなくなるので通す
export const useFragmentTarget = (): RefCallback<HTMLElement> =>
  useCallback((target: HTMLElement | null) => {
    if (target === null) return undefined;
    const handler = (event: NavigateEvent): void => {
      if (!event.hashChange || event.navigationType === 'traverse') return;
      if (HASH_INDEX_RE.test(new URL(event.destination.url).hash)) return;
      event.preventDefault();
      target.focus();
    };
    navigation.addEventListener('navigate', handler);
    return () => {
      navigation.removeEventListener('navigate', handler);
    };
  }, []);

export const writeHashIndex = (index: number): void => {
  if (typeof window === 'undefined') return;
  const nextHash = `#${(index + 1).toString()}`;
  if (window.location.hash === nextHash) return;
  window.history.replaceState(null, '', nextHash);
  // replaceState は hashchange を発火しないので明示的に dispatch する
  window.dispatchEvent(new Event('hashchange'));
};
