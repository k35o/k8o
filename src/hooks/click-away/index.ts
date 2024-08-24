'use client';

import { MutableRefObject, useEffect, useRef } from 'react';

export const useClickAway = <T extends Element = HTMLElement>(
  callback: () => void,
): MutableRefObject<T | null> => {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handler: EventListener = (e) => {
      const element = ref.current;
      if (element && !element.contains(e.target as HTMLElement)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);

    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [callback]);

  return ref;
};
