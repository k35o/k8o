'use client';

import { useEffect, useEffectEvent } from 'react';

const NEXT_KEYS = new Set([
  'ArrowRight',
  'ArrowDown',
  'PageDown',
  ' ',
  'Spacebar',
]);
const PREV_KEYS = new Set(['ArrowLeft', 'ArrowUp', 'PageUp']);
const FULLSCREEN_KEYS = new Set(['f', 'F']);

export const useKeyboardNav = ({
  onNext,
  onPrev,
  onFirst,
  onLast,
  onToggleFullscreen,
}: {
  onNext: () => void;
  onPrev: () => void;
  onFirst: () => void;
  onLast: () => void;
  onToggleFullscreen: () => void;
}) => {
  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.defaultPrevented) return;
    const { target } = event;
    if (target instanceof HTMLElement) {
      const tag = target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) {
        return;
      }
    }
    if (NEXT_KEYS.has(event.key)) {
      event.preventDefault();
      onNext();
      return;
    }
    if (PREV_KEYS.has(event.key)) {
      event.preventDefault();
      onPrev();
      return;
    }
    if (event.key === 'Home') {
      event.preventDefault();
      onFirst();
      return;
    }
    if (event.key === 'End') {
      event.preventDefault();
      onLast();
      return;
    }
    if (FULLSCREEN_KEYS.has(event.key)) {
      event.preventDefault();
      onToggleFullscreen();
    }
  });

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      handleKeyDown(event);
    };
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, []);
};
