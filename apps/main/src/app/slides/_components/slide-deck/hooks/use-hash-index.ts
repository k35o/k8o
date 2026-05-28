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
  const value = Number.parseInt(match[1] ?? '', 10);
  return Number.isInteger(value) ? Math.max(0, value - 1) : 0;
};

const getServerSnapshot = (): number => 0;

/**
 * URL ハッシュ (#3 等) を購読し、現在の index (0-origin) を返す。
 * useSyncExternalStore を使うため、明示的な useEffect は不要。
 * SSR では 0 を返す。
 */
export const useHashIndex = (): number =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

/**
 * URL ハッシュを書き換える。
 * `replaceState` は hashchange を発火しないので、useHashIndex の再評価を促すため
 * 明示的に hashchange イベントを dispatch する。
 */
export const writeHashIndex = (index: number): void => {
  if (typeof window === 'undefined') return;
  const nextHash = `#${(index + 1).toString()}`;
  if (window.location.hash === nextHash) return;
  window.history.replaceState(null, '', nextHash);
  window.dispatchEvent(new Event('hashchange'));
};
