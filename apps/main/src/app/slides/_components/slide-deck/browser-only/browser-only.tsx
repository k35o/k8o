'use client';

import { Suspense, use } from 'react';
import type { FC, ReactNode } from 'react';
import { browser } from 'react-dom';

const Deferred: FC<{ children: ReactNode }> = ({ children }) => {
  use(browser());
  return children;
};

// 表示する枚は URL の hash で決まりブラウザでしか分からないため、サーバーでは
// 中身を描かず 1 枚目がちらつくのを避ける
export const BrowserOnly: FC<{ children: ReactNode }> = ({ children }) => (
  <Suspense fallback={null}>
    <Deferred>{children}</Deferred>
  </Suspense>
);
