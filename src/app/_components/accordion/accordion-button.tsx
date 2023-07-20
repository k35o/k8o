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
        'hover:bg-gray-100',
        'focus:first:border-transparent focus:first:outline-none focus:first:ring-2 focus:first:ring-blue-500',
      )}
      aria-expanded={open}
      aria-controls={`${id}-panel`}
      id={`${id}-button`}
      onClick={() => setOpen((open) => !open)}
    >
      {children}
      {open ? (
        <ChevronUpIcon className="h-4 w-4" />
      ) : (
        <ChevronDownIcon className="h-4 w-4" />
      )}
    </button>
  );
};
