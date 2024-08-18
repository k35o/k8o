'use client';

import { IconButton } from '@/components/icon-button';
import { MoonStar, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { FC, useCallback } from 'react';

export const ToggleTheme: FC = () => {
  const { theme, setTheme, systemTheme } = useTheme();

  const handleThemeCallback = useCallback(() => {
    if (theme === 'system') {
      return setTheme(systemTheme === 'dark' ? 'light' : 'dark');
    }
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme, systemTheme]);

  return (
    <IconButton onClick={handleThemeCallback}>
      <MoonStar className="size-8 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Sun className="absolute size-8 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">テーマを切り替える</span>
    </IconButton>
  );
};
