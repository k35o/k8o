'use client';

import { type RefObject, useEffect, useRef } from 'react';

export const useClickAway = <T extends Element = HTMLElement>(
  callback: (e: Event) => void,
  enabled = true,
): RefObject<T | null> => {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!enabled) return;

    const handler: EventListener = (e) => {
      const element = ref.current;
      if (element && !element.contains(e.target as HTMLElement)) {
        callback(e);
      }
    };

    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);

    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [callback, enabled]);

  return ref;
};
