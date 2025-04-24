'use client';

import { IconButton } from '@/components/icon-button';
import { DarkModeIcon, LightModeIcon } from '@/components/icons';
import * as motion from 'motion/react-client';
import { useTheme } from 'next-themes';
import { FC, useCallback, useMemo } from 'react';

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
    <IconButton onClick={handleThemeCallback}>
      <motion.span
        className="size-8 scale-100 dark:scale-0"
        animate={nextTheme}
        variants={{
          light: {
            scale: 0,
            rotate: 90,
          },
          dark: {
            scale: 1,
            rotate: 0,
          },
        }}
      >
        <DarkModeIcon size="lg" />
      </motion.span>
      <motion.span
        className="absolute size-8 scale-0 dark:scale-100"
        animate={nextTheme}
        variants={{
          dark: {
            scale: 0,
            rotate: 90,
          },
          light: {
            scale: 1,
            rotate: 0,
          },
        }}
      >
        <LightModeIcon size="lg" />
      </motion.span>
      <span className="sr-only">テーマを切り替える</span>
    </IconButton>
  );
};
