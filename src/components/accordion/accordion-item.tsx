'use client';

import { FC, PropsWithChildren, useId } from 'react';
import { RecoilRoot } from 'recoil';
import { itemIdState, openState } from './state';

export const AccordionItem: FC<
  PropsWithChildren<{ defaultOpen?: boolean }>
> = ({ children, defaultOpen = false }) => {
  const id = useId();
  return (
    <RecoilRoot
      initializeState={(mutableSnapshot) => {
        mutableSnapshot.set(openState, defaultOpen);
        mutableSnapshot.set(itemIdState, id);
      }}
    >
      <div className="border-t border-borderLight last:border-b">
        {children}
      </div>
    </RecoilRoot>
  );
};
