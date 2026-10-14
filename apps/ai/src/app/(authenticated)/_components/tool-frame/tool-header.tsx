'use client';

import { IconButton, NavigationMenuIcon } from '@k8ordo/ui';
import type { FC, ReactNode } from 'react';

import { useSidebarMenu } from './sidebar-menu';

type ToolHeaderProps = {
  children: ReactNode;
};

export const ToolHeader: FC<ToolHeaderProps> = ({ children }) => {
  const { open } = useSidebarMenu();
  return (
    <header className="border-border-mute flex flex-wrap items-center gap-x-4 gap-y-2 border-b px-4 py-2">
      <div className="lg:hidden">
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
