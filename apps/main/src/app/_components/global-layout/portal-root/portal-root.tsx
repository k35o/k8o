'use client';

import { PortalRootProvider } from '@k8o/arte-odyssey';
import { type FC, type ReactNode, useRef } from 'react';

export const PortalRoot: FC<{ children: ReactNode }> = ({ children }) => {
  const portalRef = useRef<HTMLDivElement>(null);
  return (
    <PortalRootProvider value={portalRef}>
      {children}
      <div className="relative z-100" ref={portalRef} />
    </PortalRootProvider>
  );
};
