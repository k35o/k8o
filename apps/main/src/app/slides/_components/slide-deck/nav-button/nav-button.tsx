'use client';

import { ChevronIcon, IconButton } from '@k8o/arte-odyssey';
import type { FC } from 'react';

type Props = {
  direction: 'prev' | 'next';
  disabled: boolean;
  onAction: () => void;
};

export const NavButton: FC<Props> = ({ direction, disabled, onAction }) => (
  <IconButton
    color="transparent"
    label={direction === 'prev' ? '前のスライド' : '次のスライド'}
    onAction={onAction}
    renderItem={({
      className,
      children,
      'aria-label': ariaLabel,
      triggerProps,
    }) => (
      <button
        aria-label={ariaLabel}
        className={className}
        disabled={disabled}
        type="button"
        {...triggerProps}
      >
        {children}
      </button>
    )}
  >
    <ChevronIcon direction={direction === 'prev' ? 'left' : 'right'} />
  </IconButton>
);
