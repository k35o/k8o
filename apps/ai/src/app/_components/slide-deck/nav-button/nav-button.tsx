'use client';

import { ChevronIcon, IconButton } from '@k8o/arte-odyssey';
import type { FC } from 'react';

type Props = {
  direction: 'prev' | 'next';
  disabled: boolean;
  onAction: () => void;
};

// renderItem でカスタム描画すると onAction が配線されない（triggerProps は Tooltip 用のみ）
// ため、既定の button 描画に渡す。スライド送りは軽い同期更新なので、transition で包まれる
// onAction ではなく素の onClick を使う（transition だと保留中は aria-busy + disabled になり、
// 連打や他の保留中アクションとの絡みで操作が詰まる）。
export const NavButton: FC<Props> = ({ direction, disabled, onAction }) => (
  <IconButton
    color="transparent"
    disabled={disabled}
    label={direction === 'prev' ? '前のスライド' : '次のスライド'}
    onClick={() => {
      onAction();
    }}
  >
    <ChevronIcon direction={direction === 'prev' ? 'left' : 'right'} />
  </IconButton>
);
