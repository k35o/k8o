'use client';

import {
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/solid';
import { FC, PropsWithChildren } from 'react';
import clsx from 'clsx';
import { useItemId, useOpen, useToggleOpen } from './context';

export const AccordionButton: FC<PropsWithChildren<{}>> = ({
  children,
}) => {
  const id = useItemId();
  const open = useOpen();
  const toggleOpen = useToggleOpen();

  return (
    <button
      type="button"
      className={clsx(
        'flex w-full flex-row items-center justify-between rounded-lg p-2',
        'hover:bg-grayHover active:bg-grayActive',
        'focus-visible::first:ring-focusRing focus-visible::first:border-transparent focus-visible::first:outline-none focus-visible::first:ring-2',
      )}
      aria-expanded={open}
      aria-controls={`${id}-panel`}
      id={`${id}-button`}
      onClick={toggleOpen}
    >
      {children}
      {open ? (
        <ChevronUpIcon className="size-4 shrink-0" />
      ) : (
        <ChevronDownIcon className="size-4 shrink-0" />
      )}
    </button>
  );
};
