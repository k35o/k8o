'use client';

import { useColorScheme } from '@k8ordo/color-scheme';
import { DarkModeIcon, IconButton, LightModeIcon } from '@k8ordo/ui';
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
        <DarkModeIcon size="lg" />
      </span>
      <span className={styles.sun}>
        <LightModeIcon size="lg" />
      </span>
    </IconButton>
  );
};
