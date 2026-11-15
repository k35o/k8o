'use client';

import { useColorScheme } from '@k8ordo/color-scheme';
import { IconButton } from '@k8ordo/ui';
import { MoonIcon, SunIcon } from '@k8ordo/ui/icons';
import type { FC } from 'react';

import styles from './toggle-theme.module.css';

export const ToggleTheme: FC = () => {
  const { scheme, setPreference } = useColorScheme();

  return (
    <IconButton
      label="テーマを切り替える"
      onClick={() => {
        setPreference(scheme === 'dark' ? 'light' : 'dark');
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
