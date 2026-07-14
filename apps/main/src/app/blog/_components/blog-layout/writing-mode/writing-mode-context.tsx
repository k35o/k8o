'use client';

import { createSafeContext } from '@k8o/arte-odyssey';
import { useCallback, useMemo, useState } from 'react';
import type { FC, ReactNode } from 'react';

import type { WritingMode } from './writing-mode-params';

type WritingModeContextValue = {
  mode: WritingMode;
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

  const value = useMemo(() => ({ mode, toggle }), [mode, toggle]);

  return (
    <WritingModeContextProvider value={value}>
      {children}
    </WritingModeContextProvider>
  );
};
