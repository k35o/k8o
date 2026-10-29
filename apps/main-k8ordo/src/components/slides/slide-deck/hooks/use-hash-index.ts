'use client';

import { useSyncExternalStore } from 'react';

const HASH_INDEX_RE = /^#(\d+)$/u;

const subscribe = (callback: () => void): (() => void) => {
  window.addEventListener('hashchange', callback);
  return () => {
    window.removeEventListener('hashchange', callback);
  };
};

const getSnapshot = (): number => {
  const match = HASH_INDEX_RE.exec(window.location.hash);
  if (match === null) return 0;
  const value = Number(match[1] ?? '');
  return Number.isInteger(value) ? Math.max(0, value - 1) : 0;
};

const getServerSnapshot = (): number => 0;

export const useHashIndex = (): number =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

export const writeHashIndex = (index: number): void => {
  if (typeof window === 'undefined') return;
  const nextHash = `#${(index + 1).toString()}`;
  if (window.location.hash === nextHash) return;
  window.history.replaceState(null, '', nextHash);
  // replaceState は hashchange を発火しないので明示的に dispatch する
  window.dispatchEvent(new Event('hashchange'));
};
