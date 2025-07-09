'use client';

import { useItemId, useOpen } from './context';
import { cn } from '@k8o/helpers/cn';
import { FC, PropsWithChildren } from 'react';

export const AccordionPanel: FC<PropsWithChildren> = ({
  children,
}) => {
  const id = useItemId();
  const open = useOpen();
  return (
    <div
      id={`${id}-panel`}
      role="region"
      aria-labelledby={`${id}-button`}
      hidden={!open}
      className={cn({ hidden: !open }, 'p-2')}
    >
      {children}
    </div>
  );
};
