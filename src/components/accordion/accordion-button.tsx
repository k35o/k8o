'use client';

import { FC, PropsWithChildren } from 'react';
import { useItemId, useOpen, useToggleOpen } from './context';
import { cn } from '@/utils/cn';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const AccordionButton: FC<PropsWithChildren<{}>> = ({
  children,
}) => {
  const id = useItemId();
  const open = useOpen();
  const toggleOpen = useToggleOpen();

  return (
    <button
      type="button"
      className={cn(
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
        <ChevronUp className="size-4 shrink-0" />
      ) : (
        <ChevronDown className="size-4 shrink-0" />
      )}
    </button>
  );
};
