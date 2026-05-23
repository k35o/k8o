'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export const ScrollToTopOnPathChange = () => {
  const pathname = usePathname();
  const prevPathname = useRef<string | null>(null);
  const isPopState = useRef(false);

  useEffect(() => {
    const handler = () => {
      isPopState.current = true;
    };
    window.addEventListener('popstate', handler);
    return () => {
      window.removeEventListener('popstate', handler);
    };
  }, []);

  useEffect(() => {
    const prev = prevPathname.current;
    prevPathname.current = pathname;

    if (prev === null || prev === pathname) return;

    const popState = isPopState.current;
    isPopState.current = false;
    if (popState) return;
    if (window.location.hash) return;

    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};
