'use client';

import { IconButton, NavigationMenuIcon } from '@k8ordo/ui';
import type { FC, ReactNode } from 'react';

import { useSidebarMenu } from './sidebar-menu';

import styles from './tool-header.module.css';

type ToolHeaderProps = {
  children: ReactNode;
};

export const ToolHeader: FC<ToolHeaderProps> = ({ children }) => {
  const { open } = useSidebarMenu();
  return (
    <header className={styles.root}>
      <div className={styles.menu}>
        <IconButton
          color="transparent"
          label="メニューを開く"
          onClick={open}
          size="sm"
        >
          <NavigationMenuIcon size="sm" />
        </IconButton>
      </div>
      {children}
    </header>
  );
};
