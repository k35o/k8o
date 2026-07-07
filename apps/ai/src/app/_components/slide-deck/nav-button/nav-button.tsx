'use client';

import { ChevronIcon, IconButton } from '@k8o/arte-odyssey';
import type { FC } from 'react';

type Props = {
  direction: 'prev' | 'next';
  disabled: boolean;
  onAction: () => void;
};

// renderItem でカスタム描画すると onAction が配線されない（triggerProps は Tooltip 用のみ）
// ため、既定の button 描画に disabled / onAction を渡す。
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
