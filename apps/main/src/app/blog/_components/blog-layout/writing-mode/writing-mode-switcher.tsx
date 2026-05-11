'use client';

import {
  HorizontalWritingIcon,
  IconButton,
  VerticalWritingIcon,
} from '@k8o/arte-odyssey';
import type { FC } from 'react';

import { useWritingMode } from './writing-mode-context';

export const WritingModeSwitcher: FC = () => {
  const { mode, toggle } = useWritingMode();
  const isVertical = mode === 'vertical';
  const label = isVertical ? '横書きに切り替える' : '縦書きに切り替える';

  return (
    <IconButton
      aria-pressed={isVertical}
      bg="base"
      label={label}
      onAction={toggle}
      size="md"
    >
      {isVertical ? (
        <HorizontalWritingIcon size="md" />
      ) : (
        <VerticalWritingIcon size="md" />
      )}
    </IconButton>
  );
};
