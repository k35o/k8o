'use client';

import { IconButton } from '@k8o/arte-odyssey/icon-button';
import { DarkModeIcon, LightModeIcon } from '@k8o/arte-odyssey/icons';
import * as motion from 'motion/react-client';
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
      <motion.span
        animate={nextTheme}
        className="size-8 scale-100 dark:scale-0"
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
        animate={nextTheme}
        className="absolute size-8 scale-0 dark:scale-100"
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
    </IconButton>
  );
};
