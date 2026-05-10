'use client';

import { createSafeContext, useLocalStorage } from '@k8o/arte-odyssey';
import { type FC, type ReactNode, useCallback, useMemo } from 'react';

export type WritingMode = 'horizontal' | 'vertical';

const STORAGE_KEY = 'blog-writing-mode';

type WritingModeContextValue = {
  mode: WritingMode;
  setMode: (mode: WritingMode) => void;
  toggle: () => void;
};

const [WritingModeContext, useWritingMode] =
  createSafeContext<WritingModeContextValue>(
    'useWritingMode must be used within a WritingModeProvider',
  );

export { useWritingMode };

export const WritingModeProvider: FC<{
  children: ReactNode;
  defaultMode: WritingMode;
}> = ({ children, defaultMode }) => {
  const [mode, setMode] = useLocalStorage<WritingMode>(
    STORAGE_KEY,
    defaultMode,
  );

  const toggle = useCallback(() => {
    setMode(mode === 'horizontal' ? 'vertical' : 'horizontal');
  }, [mode, setMode]);

  const value = useMemo(
    () => ({ mode, setMode, toggle }),
    [mode, setMode, toggle],
  );

  return (
    <WritingModeContext.Provider value={value}>
      {children}
    </WritingModeContext.Provider>
  );
};
