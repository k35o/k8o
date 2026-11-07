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

export const useIsFullscreen = (): boolean =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

export const toggleFullscreen = (): void => {
  if (typeof document === 'undefined') return;
  if (document.fullscreenElement === null) {
    void document.documentElement.requestFullscreen();
  } else {
    void document.exitFullscreen();
  }
};
