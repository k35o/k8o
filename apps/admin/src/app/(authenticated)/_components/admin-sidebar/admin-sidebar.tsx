'use client';

import {
  Drawer,
  IconButton,
  LogoIcon,
  NavigationMenuIcon,
} from '@k8o/arte-odyssey';
import { type FC, useState } from 'react';

import { SignOutButton } from '@/app/(authenticated)/_components/sign-out-button';
import { ToggleTheme } from '@/app/(authenticated)/_components/toggle-theme';

import { SidebarNav } from './sidebar-nav';

const Brand: FC = () => (
  <div className="flex items-center gap-2">
    <LogoIcon size="md" />
    <span className="font-noto-sans-jp text-lg font-bold tracking-tight">
      k8o
    </span>
    <span className="text-fg-mute text-xs">Admin</span>
  </div>
);

const SidebarFooter: FC = () => (
  <div className="border-border-mute mt-auto flex flex-col gap-1 border-t p-3">
    <SignOutButton />
    <div className="flex items-center justify-between px-3 py-2">
      <span className="text-fg-mute text-sm">テーマ</span>
      <ToggleTheme />
    </div>
  </div>
);

export const AdminSidebar: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* デスクトップ: 左固定サイドバー */}
      <aside className="bg-bg-base border-border-mute hidden w-64 shrink-0 flex-col border-r md:sticky md:top-0 md:flex md:h-dvh">
        <div className="border-border-mute border-b px-5 py-4">
          <Brand />
        </div>
        <SidebarNav />
        <SidebarFooter />
      </aside>

      {/* モバイル: 上部バー */}
      <div className="bg-bg-base border-border-mute flex items-center justify-between border-b px-4 py-3 md:hidden">
        <Brand />
        <IconButton
          bg="transparent"
          label="メニューを開く"
          onClick={() => {
            setIsOpen(true);
          }}
        >
          <NavigationMenuIcon size="md" />
        </IconButton>
      </div>

      {/* モバイル: ドロワー */}
      <Drawer isOpen={isOpen} onClose={close} side="left" title={<Brand />}>
        <div className="flex h-full flex-col">
          <SidebarNav onNavigate={close} />
          <SidebarFooter />
        </div>
      </Drawer>
    </>
  );
};
