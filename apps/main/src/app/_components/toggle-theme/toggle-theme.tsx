'use client';

import { DarkModeIcon, IconButton, LightModeIcon } from '@k8ordo/ui';
import { useTheme } from 'next-themes';
import type { FC } from 'react';

import styles from './toggle-theme.module.css';

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
      <span className={styles.moon}>
        <DarkModeIcon size="lg" />
      </span>
      <span className={styles.sun}>
        <LightModeIcon size="lg" />
      </span>
    </IconButton>
  );
};
