'use client';

import { useCallback, useEffect, useState } from 'react';

type Step = {
  count: number;
  next: () => void;
  back: () => void;
  isDisabledBack: boolean;
  isDisabledNext: boolean;
};

type UseStep = (props: {
  initialCount: number;
  maxCount: number;
}) => Step;

export const useStep: UseStep = ({ initialCount, maxCount }) => {
  const [count, setCount] = useState(initialCount);
  const isDisabledBack = count === initialCount;
  const isDisabledNext = count === maxCount;

  const back = useCallback(() => {
    setCount((prev) => {
      if (prev === initialCount) return prev;
      return prev - 1;
    });
  }, [initialCount]);

  const next = useCallback(() => {
    setCount((prev) => {
      if (prev === maxCount) return prev;
      return prev + 1;
    });
  }, [maxCount]);

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') back();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', listener);

    return () => {
      window.removeEventListener('keydown', listener);
    };
  }, [back, next]);

  return {
    count,
    next,
    back,
    isDisabledBack,
    isDisabledNext,
  };
};
