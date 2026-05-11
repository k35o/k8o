'use client';

import { createSafeContext } from '@k8o/arte-odyssey';
import { type FC, type ReactNode, useCallback, useMemo, useState } from 'react';

import type { WritingMode } from './writing-mode-params';

type WritingModeContextValue = {
  mode: WritingMode;
  setMode: (mode: WritingMode) => void;
  toggle: () => void;
};

const [WritingModeContextProvider, useWritingMode] =
  createSafeContext<WritingModeContextValue>(
    'useWritingMode must be used within a WritingModeProvider',
  );

export { useWritingMode };

export const WritingModeProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [mode, setMode] = useState<WritingMode>('horizontal');

  const toggle = useCallback(() => {
    setMode((prev) => (prev === 'horizontal' ? 'vertical' : 'horizontal'));
  }, []);

  const value = useMemo(
    () => ({ mode, setMode, toggle }),
    [mode, setMode, toggle],
  );

  return (
    <WritingModeContextProvider value={value}>
      {children}
    </WritingModeContextProvider>
  );
};
