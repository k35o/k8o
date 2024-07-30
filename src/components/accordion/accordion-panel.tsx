'use client';

import { FC, PropsWithChildren } from 'react';
import clsx from 'clsx';
import { useItemId, useOpen } from './context';

export const AccordionPanel: FC<PropsWithChildren<{}>> = ({
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
      className={clsx({ hidden: !open }, 'p-2')}
    >
      {children}
    </div>
  );
};
