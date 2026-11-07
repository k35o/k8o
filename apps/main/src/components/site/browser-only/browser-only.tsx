'use client';

import { Suspense, use } from 'react';
import type { FC, ReactNode } from 'react';
import { browser } from 'react-dom';

const Deferred: FC<{ children: ReactNode }> = ({ children }) => {
  use(browser());
  return children;
};

export const BrowserOnly: FC<{ children: ReactNode; fallback?: ReactNode }> = ({
  children,
  fallback = null,
}) => (
  <Suspense fallback={fallback}>
    <Deferred>{children}</Deferred>
  </Suspense>
);
