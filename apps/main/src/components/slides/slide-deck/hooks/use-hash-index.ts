'use client';

import { useState, useSyncExternalStore } from 'react';

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

export const writeHashIndex = (index: number): void => {
  if (typeof window === 'undefined') return;
  const nextHash = `#${(index + 1).toString()}`;
  if (window.location.hash === nextHash) return;
  window.history.replaceState(null, '', nextHash);
  // replaceState は hashchange を発火しないので明示的に dispatch する
  window.dispatchEvent(new Event('hashchange'));
};
