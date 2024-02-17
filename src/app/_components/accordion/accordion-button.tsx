'use client';

import {
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/solid';
import { FC, PropsWithChildren } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { itemIdState, openState } from './state';
import clsx from 'clsx';

export const AccordionButton: FC<PropsWithChildren<{}>> = ({
  children,
}) => {
  const [open, setOpen] = useRecoilState(openState);
  const id = useRecoilValue(itemIdState);
  return (
    <button
      type="button"
      className={clsx(
        'flex w-full flex-row items-center justify-between rounded-md p-2',
        'hover:bg-grayHover active:bg-grayActive',
        'focus-visible::first:ring-focusRing focus-visible::first:border-transparent focus-visible::first:outline-none focus-visible::first:ring-2',
      )}
      aria-expanded={open}
      aria-controls={`${id}-panel`}
      id={`${id}-button`}
      onClick={() => setOpen((open) => !open)}
    >
      {children}
      {open ? (
        <ChevronUpIcon className="h-4 w-4 flex-shrink-0" />
      ) : (
        <ChevronDownIcon className="h-4 w-4 flex-shrink-0" />
      )}
    </button>
  );
};
