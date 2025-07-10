import { useEffect } from 'react';

export const useInterval = (
  callback: () => void,
  timeout: number,
): void => {
  useEffect(() => {
    let intervalId: number | null = null;

    intervalId = window.setInterval(() => {
      callback();
    }, timeout);

    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [callback, timeout]);
};
