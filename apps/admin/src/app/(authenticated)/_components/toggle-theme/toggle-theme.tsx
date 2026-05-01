'use client';

import { DarkModeIcon, IconButton, LightModeIcon } from '@k8o/arte-odyssey';
import { useTheme } from 'next-themes';
import { type FC, useCallback, useMemo } from 'react';

export const ToggleTheme: FC = () => {
  const { theme, setTheme, systemTheme } = useTheme();

  const nextTheme = useMemo(() => {
    if (theme === 'system') {
      return systemTheme === 'dark' ? 'light' : 'dark';
    }
    return theme === 'dark' ? 'light' : 'dark';
  }, [theme, systemTheme]);

  const handleThemeCallback = useCallback(() => {
    setTheme(nextTheme);
  }, [nextTheme, setTheme]);

  return (
    <IconButton label="テーマを切り替える" onClick={handleThemeCallback}>
      <span className="size-8 transition-transform duration-300 dark:scale-0 dark:rotate-90">
        <DarkModeIcon size="lg" />
      </span>
      <span className="absolute size-8 scale-0 rotate-90 transition-transform duration-300 dark:scale-100 dark:rotate-0">
        <LightModeIcon size="lg" />
      </span>
    </IconButton>
  );
};
