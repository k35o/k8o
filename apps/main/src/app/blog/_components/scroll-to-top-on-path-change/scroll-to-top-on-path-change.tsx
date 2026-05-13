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
    if (prevPathname.current === null) {
      prevPathname.current = pathname;
      return;
    }
    if (prevPathname.current === pathname) return;
    prevPathname.current = pathname;

    if (isPopState.current) {
      isPopState.current = false;
      return;
    }

    if (window.location.hash) return;

    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};
