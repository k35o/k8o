'use client';

import { Drawer } from '@k8ordo/ui';
import { SignOutButton } from '@repo/auth-shell/sign-out-button';
import Link from 'next/link';
import { Suspense, useLayoutEffect, useState } from 'react';
import type { FC, ReactNode } from 'react';

import { ToggleTheme } from '@/app/_components/toggle-theme';

import { CurrentToolNav, ToolNav } from '../tool-nav';
import { SidebarMenuContext, useSidebarMenu } from './sidebar-menu';

type SidebarBodyProps = {
  sidebar: ReactNode;
};

const SidebarBody: FC<SidebarBodyProps> = ({ sidebar }) => {
  const { close } = useSidebarMenu();
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="px-3 pt-3">
        {/* /chat/[threadId] のプリレンダーでは ID が決まらず、現在地のセグメントを読むと止まるので、
            ナビだけを待たせて枠の残りを静的な殻に入れる */}
        <Suspense fallback={<ToolNav current={null} onNavigate={close} />}>
          <CurrentToolNav onNavigate={close} />
        </Suspense>
      </div>
      {sidebar}
      <div className="flex items-center justify-between px-4 py-3">
        <SignOutButton />
        <ToggleTheme />
      </div>
    </div>
  );
};

type ToolFrameProps = {
  sidebar: ReactNode;
  children: ReactNode;
};

export const ToolFrame: FC<ToolFrameProps> = ({ sidebar, children }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerKey, setDrawerKey] = useState(0);
  // 枠ごと Activity で隠れると Modal の effect が止まって dialog を閉じないので、隠れるときに Drawer を作り直し、
  // 開いた dialog を文書から外して inert のまま残さない。ふだんの開け閉めは Modal に close() させ、
  // 閉じるアニメーションとメニューのボタンへのフォーカスの戻りを残す
  useLayoutEffect(
    () => () => {
      setMenuOpen(false);
      setDrawerKey((key) => key + 1);
    },
    [],
  );
  const menu = {
    open: (): void => {
      setMenuOpen(true);
    },
    close: (): void => {
      setMenuOpen(false);
    },
  };

  return (
    <SidebarMenuContext value={menu}>
      <div className="flex min-h-0 flex-1">
        <aside className="bg-bg-subtle border-border-mute hidden w-60 shrink-0 flex-col border-r lg:flex">
          <div className="px-5 pt-4 pb-1">
            <Link className="text-fg-base text-sm font-bold" href="/">
              k8o AI Studio
            </Link>
          </div>
          <SidebarBody sidebar={sidebar} />
        </aside>

        <Drawer
          isOpen={menuOpen}
          key={drawerKey}
          onClose={menu.close}
          side="left"
          title="k8o AI Studio"
        >
          {/* 閉じている間は中身を描画しない。常設のサイドバーと同じ内容が DOM に二重にあると、
              ランドマークが重複するため。 */}
          {menuOpen ? <SidebarBody sidebar={sidebar} /> : null}
        </Drawer>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</main>
      </div>
    </SidebarMenuContext>
  );
};
