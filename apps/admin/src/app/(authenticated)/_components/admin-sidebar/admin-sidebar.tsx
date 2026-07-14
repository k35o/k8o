'use client';

import {
  Drawer,
  IconButton,
  LogoIcon,
  NavigationMenuIcon,
} from '@k8o/arte-odyssey';
import { Suspense, useState } from 'react';
import type { FC } from 'react';

import { SignOutButton } from '@/app/(authenticated)/_components/sign-out-button';
import { ToggleTheme } from '@/app/(authenticated)/_components/toggle-theme';

import { SidebarNav, SidebarNavList } from './sidebar-nav';

// usePathname は cacheComponents 下では動的データのため、Suspense 境界で包む。
// 静的シェルではアクティブ表示なし(pathname=null)のリストをフォールバックとして描画する。
const NavWithSuspense: FC<{ onNavigate?: () => void }> = ({ onNavigate }) => (
  <Suspense fallback={<SidebarNavList pathname={null} />}>
    <SidebarNav {...(onNavigate === undefined ? {} : { onNavigate })} />
  </Suspense>
);

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
      <aside className="bg-bg-base border-border-mute hidden w-64 shrink-0 flex-col border-r md:sticky md:top-0 md:flex md:h-dvh">
        <div className="border-border-mute border-b px-5 py-4">
          <Brand />
        </div>
        <NavWithSuspense />
        <SidebarFooter />
      </aside>

      <div className="bg-bg-base border-border-mute flex items-center justify-between border-b px-4 py-3 md:hidden">
        <Brand />
        <IconButton
          color="transparent"
          label="メニューを開く"
          onClick={() => {
            setIsOpen(true);
          }}
        >
          <NavigationMenuIcon size="md" />
        </IconButton>
      </div>

      <Drawer isOpen={isOpen} onClose={close} side="left" title={<Brand />}>
        <div className="flex h-full flex-col">
          <NavWithSuspense onNavigate={close} />
          <SidebarFooter />
        </div>
      </Drawer>
    </>
  );
};
