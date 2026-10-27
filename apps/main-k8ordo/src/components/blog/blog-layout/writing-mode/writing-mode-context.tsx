'use client';

import { createContext, use, useCallback, useMemo, useState } from 'react';
import type { FC, ReactNode } from 'react';

import type { WritingMode } from './writing-mode-params';

type WritingModeContextValue = {
  mode: WritingMode;
  toggle: () => void;
};

const WritingModeContext = createContext<WritingModeContextValue | null>(null);

export const useWritingMode = (): WritingModeContextValue => {
  const value = use(WritingModeContext);
  if (value === null) {
    throw new Error('useWritingMode must be used within a WritingModeProvider');
  }
  return value;
};

export const WritingModeProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [mode, setMode] = useState<WritingMode>('horizontal');

  const toggle = useCallback(() => {
    setMode((prev) => (prev === 'horizontal' ? 'vertical' : 'horizontal'));
  }, []);

  const value = useMemo(() => ({ mode, toggle }), [mode, toggle]);

  return <WritingModeContext value={value}>{children}</WritingModeContext>;
};
