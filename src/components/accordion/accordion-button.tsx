'use client';

import { FC, PropsWithChildren } from 'react';
import { useItemId, useOpen, useToggleOpen } from './context';
import { cn } from '@/utils/cn';
import { ChevronDown } from 'lucide-react';
import * as motion from 'motion/react-client';

export const AccordionButton: FC<PropsWithChildren> = ({
  children,
}) => {
  const id = useItemId();
  const open = useOpen();
  const toggleOpen = useToggleOpen();

  return (
    <button
      type="button"
      className={cn(
        'flex w-full flex-row items-center justify-between rounded-md p-2',
        'hover:bg-bg-mute',
        'focus-visible::first:ring-border-info focus-visible:bg-bg-mute focus-visible::first:bordertransparent focus-visible::first:outline-none focus-visible::first:ring-2',
      )}
      aria-expanded={open}
      aria-controls={`${id}-panel`}
      id={`${id}-button`}
      onClick={toggleOpen}
    >
      {children}
      <motion.span
        animate={open ? { rotate: 180 } : { rotate: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ChevronDown className="size-6" />
      </motion.span>
    </button>
  );
};
