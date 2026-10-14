'use client';

import { useSyncExternalStore } from 'react';

// ページ先頭付近では隠さない
const THRESHOLD = 50;

let isScrollingDown = false;
let prevScrollY = 0;

const subscribe = (callback: () => void): (() => void) => {
  const handleScroll = (): void => {
    const { scrollY } = window;
    if (scrollY > prevScrollY && scrollY > THRESHOLD) {
      isScrollingDown = true;
    } else if (scrollY < prevScrollY) {
      isScrollingDown = false;
    }
    prevScrollY = scrollY;
    callback();
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
};

const getSnapshot = (): boolean => isScrollingDown;
const getServerSnapshot = (): boolean => false;

export const useIsScrollingDown = (): boolean =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
