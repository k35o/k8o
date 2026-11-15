'use client';

import { IconButton } from '@k8ordo/ui';
import { TextHorizontalIcon, TextVerticalIcon } from '@k8ordo/ui/icons';
import type { FC } from 'react';

import { useWritingMode } from './writing-mode-context';

export const WritingModeSwitcher: FC = () => {
  const { mode, toggle } = useWritingMode();
  const isVertical = mode === 'vertical';
  // aria-pressed と組み合わせるため状態記述のラベルにする (APG toggle button パターン)
  const label = isVertical ? '縦書きモード' : '横書きモード';

  return (
    <IconButton
      aria-pressed={isVertical}
      color="base"
      label={label}
      onAction={toggle}
      size="md"
    >
      {isVertical ? (
        <TextHorizontalIcon size="md" />
      ) : (
        <TextVerticalIcon size="md" />
      )}
    </IconButton>
  );
};
