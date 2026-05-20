'use client';

import { useSyncExternalStore } from 'react';

const subscribe = (callback: () => void): (() => void) => {
  document.addEventListener('fullscreenchange', callback);
  return () => {
    document.removeEventListener('fullscreenchange', callback);
  };
};

const getSnapshot = (): boolean => document.fullscreenElement !== null;
const getServerSnapshot = (): boolean => false;

/**
 * Fullscreen API の状態を購読する。useSyncExternalStore のため useEffect 不要。
 */
export const useIsFullscreen = (): boolean =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

/**
 * Fullscreen を toggle する (event handler から呼ぶ想定)。
 */
export const toggleFullscreen = (): void => {
  if (typeof document === 'undefined') return;
  if (document.fullscreenElement === null) {
    void document.documentElement.requestFullscreen();
  } else {
    void document.exitFullscreen();
  }
};
