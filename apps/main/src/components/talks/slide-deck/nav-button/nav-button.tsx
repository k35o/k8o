'use client';

import { IconButton } from '@k8ordo/ui';
import { ChevronIcon } from '@k8ordo/ui/icons';
import type { FC } from 'react';

type Props = {
  direction: 'prev' | 'next';
  disabled: boolean;
  onAction: () => void;
};

export const NavButton: FC<Props> = ({ direction, disabled, onAction }) => (
  <IconButton
    color="transparent"
    disabled={disabled}
    label={direction === 'prev' ? '前のスライド' : '次のスライド'}
    onAction={onAction}
  >
    <ChevronIcon direction={direction === 'prev' ? 'left' : 'right'} />
  </IconButton>
);
