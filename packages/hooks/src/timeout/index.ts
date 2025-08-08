import { useEffect } from 'react';

export const useTimeout = (callback: () => void, delay: number): void => {
  useEffect(() => {
    let timeoutId: number | null = null;

    timeoutId = window.setTimeout(() => {
      callback();
    }, delay);

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [callback, delay]);
};
