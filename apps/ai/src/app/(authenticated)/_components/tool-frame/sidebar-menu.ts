'use client';

import { createContext, use } from 'react';

type SidebarMenu = {
  open: () => void;
  close: () => void;
};

export const SidebarMenuContext = createContext<SidebarMenu | null>(null);

export const useSidebarMenu = (): SidebarMenu => {
  const menu = use(SidebarMenuContext);
  if (menu === null) {
    throw new Error('useSidebarMenu は ToolFrame の中で呼んでください');
  }
  return menu;
};
