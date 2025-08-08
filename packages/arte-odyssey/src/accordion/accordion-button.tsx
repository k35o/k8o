'use client';

import { cn } from '@k8o/helpers/cn';
import * as motion from 'motion/react-client';
import type { FC, PropsWithChildren } from 'react';
import { ChevronIcon } from '../icons';
import { useItemId, useOpen, useToggleOpen } from './context';

export const AccordionButton: FC<PropsWithChildren> = ({ children }) => {
  const id = useItemId();
  const open = useOpen();
  const toggleOpen = useToggleOpen();

  return (
    <button
      aria-controls={`${id}-panel`}
      aria-expanded={open}
      className={cn(
        'flex w-full flex-row items-center justify-between rounded-md p-2',
        'hover:bg-bg-mute',
        'focus-visible::first:bordertransparent focus-visible:bg-bg-mute focus-visible::first:outline-none focus-visible::first:ring-2 focus-visible::first:ring-border-info',
      )}
      id={`${id}-button`}
      onClick={toggleOpen}
      type="button"
    >
      {children}
      <motion.span
        animate={open ? { rotate: 180 } : { rotate: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ChevronIcon direction="down" />
      </motion.span>
    </button>
  );
};
