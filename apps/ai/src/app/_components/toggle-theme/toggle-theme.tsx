'use client';

import { DarkModeIcon, IconButton, LightModeIcon } from '@k8ordo/ui';
import { useTheme } from 'next-themes';
import type { FC } from 'react';

import styles from './toggle-theme.module.css';

export const ToggleTheme: FC = () => {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <IconButton
      label="テーマを切り替える"
      onClick={() => {
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
      }}
    >
      <span className={styles.moon}>
        <DarkModeIcon size="lg" />
      </span>
      <span className={styles.sun}>
        <LightModeIcon size="lg" />
      </span>
    </IconButton>
  );
};
