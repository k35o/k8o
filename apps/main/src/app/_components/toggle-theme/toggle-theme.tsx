'use client';

import { DarkModeIcon, IconButton, LightModeIcon } from '@k8ordo/ui';
import { useTheme } from 'next-themes';
import type { FC } from 'react';

export const ToggleTheme: FC = () => {
  const { theme, setTheme, systemTheme } = useTheme();

  const nextTheme =
    theme === 'system'
      ? systemTheme === 'dark'
        ? 'light'
        : 'dark'
      : theme === 'dark'
        ? 'light'
        : 'dark';

  const handleToggleTheme = () => {
    setTheme(nextTheme);
  };

  return (
    <IconButton label="テーマを切り替える" onClick={handleToggleTheme}>
      <span className="size-8 transition-transform duration-300 dark:scale-0 dark:rotate-90">
        <DarkModeIcon size="lg" />
      </span>
      <span className="absolute size-8 scale-0 rotate-90 transition-transform duration-300 dark:scale-100 dark:rotate-0">
        <LightModeIcon size="lg" />
      </span>
    </IconButton>
  );
};
