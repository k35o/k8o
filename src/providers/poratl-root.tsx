'use client';

import {
  createContext,
  FC,
  PropsWithChildren,
  RefObject,
  use,
} from 'react';

const PortalRootContext = createContext<
  RefObject<HTMLElement | null> | undefined
>(undefined);

export const usePortalRoot = () => {
  return use(PortalRootContext);
};

export const PortalRootProvider: FC<
  PropsWithChildren<{
    value?: RefObject<HTMLElement | null> | undefined;
  }>
> = ({ value, children }) => {
  return (
    <PortalRootContext value={value}>{children}</PortalRootContext>
  );
};
