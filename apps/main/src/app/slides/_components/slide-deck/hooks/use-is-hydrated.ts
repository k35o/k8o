'use client';

import { useEffect, useLayoutEffect, useState } from 'react';

const useBrowserLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

export const useIsHydrated = (): boolean => {
  const [isHydrated, setIsHydrated] = useState(false);
  useBrowserLayoutEffect(() => {
    setIsHydrated(true);
  }, []);
  return isHydrated;
};
