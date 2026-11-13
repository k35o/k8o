'use client';

import { IconButton } from '@k8ordo/ui';
import { MoonIcon, SunIcon } from '@k8ordo/ui/icons';
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
        <MoonIcon size="lg" />
      </span>
      <span className={styles.sun}>
        <SunIcon size="lg" />
      </span>
    </IconButton>
  );
};
