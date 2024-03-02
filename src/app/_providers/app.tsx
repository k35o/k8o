'use client';

import { ReactElement } from 'react';
import { RecoilRoot } from 'recoil';
import '@/libs/zod';

export const AppProvider = ({
  children,
}: {
  children: ReactElement;
}) => {
  return <RecoilRoot>{children}</RecoilRoot>;
};
