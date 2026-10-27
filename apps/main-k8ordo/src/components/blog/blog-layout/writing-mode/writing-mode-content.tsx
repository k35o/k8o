'use client';

import { cn } from '@repo/helpers/cn';
import type { FC, PropsWithChildren } from 'react';

import { useWritingMode } from './writing-mode-context';

import styles from './writing-mode-content.module.css';

export const WritingModeContent: FC<PropsWithChildren> = ({ children }) => {
  const { mode } = useWritingMode();
  const isVertical = mode === 'vertical';
  return (
    <div
      aria-label={isVertical ? '縦書き本文' : undefined}
      // writing-v はデザインシステムの縦書きモード。配下の style query が読む --writing を立てる
      className={cn(isVertical && 'writing-v', isVertical && styles.vertical)}
      role={isVertical ? 'region' : undefined}
      tabIndex={isVertical ? 0 : undefined}
    >
      {children}
    </div>
  );
};
