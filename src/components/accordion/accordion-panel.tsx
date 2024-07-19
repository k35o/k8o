'use client';

import { FC, PropsWithChildren } from 'react';
import { useRecoilValue } from 'recoil';
import { itemIdState, openState } from './state';
import clsx from 'clsx';

export const AccordionPanel: FC<PropsWithChildren<{}>> = ({
  children,
}) => {
  const id = useRecoilValue(itemIdState);
  const open = useRecoilValue(openState);
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
