'use client';

import { IconButton } from '@k8ordo/ui';
import { MenuIcon } from '@k8ordo/ui/icons';
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
          <MenuIcon size="sm" />
        </IconButton>
      </div>
      {children}
    </header>
  );
};
