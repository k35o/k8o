'use client';

import { IconButton } from '@/components/icon-button';
import { MoonStar, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { FC, useCallback } from 'react';

export const ToggleTheme: FC = () => {
  const { theme, setTheme, systemTheme } = useTheme();

  const handleThemeCallback = useCallback(() => {
    if (theme === 'system') {
      setTheme(systemTheme === 'dark' ? 'light' : 'dark');
      return;
    }
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme, systemTheme]);

  return (
    <IconButton onClick={handleThemeCallback}>
      <MoonStar className="size-8 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Sun className="absolute size-8 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">テーマを切り替える</span>
    </IconButton>
  );
};
