'use client';

import { useEffect, useRef } from 'react';

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
  const handlersRef = useRef({
    onNext,
    onPrev,
    onFirst,
    onLast,
    onToggleFullscreen,
  });
  useEffect(() => {
    handlersRef.current = {
      onNext,
      onPrev,
      onFirst,
      onLast,
      onToggleFullscreen,
    };
  });

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      const { target } = event;
      if (target instanceof HTMLElement) {
        const tag = target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) {
          return;
        }
      }
      const h = handlersRef.current;
      if (NEXT_KEYS.has(event.key)) {
        event.preventDefault();
        h.onNext();
        return;
      }
      if (PREV_KEYS.has(event.key)) {
        event.preventDefault();
        h.onPrev();
        return;
      }
      if (event.key === 'Home') {
        event.preventDefault();
        h.onFirst();
        return;
      }
      if (event.key === 'End') {
        event.preventDefault();
        h.onLast();
        return;
      }
      if (FULLSCREEN_KEYS.has(event.key)) {
        event.preventDefault();
        h.onToggleFullscreen();
      }
    };
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, []);
};
