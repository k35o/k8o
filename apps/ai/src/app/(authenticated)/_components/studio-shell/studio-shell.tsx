'use client';

import { Drawer, IconButton, NavigationMenuIcon } from '@k8o/arte-odyssey';
import Link from 'next/link';
import { useState } from 'react';
import type { FC, ReactNode } from 'react';

import { SidebarContent } from './sidebar-content';
import type { SidebarContentProps } from './sidebar-content';

type StudioShellProps = SidebarContentProps & {
  // ヘッダのツール固有部分（プロジェクト名・ビュー切替・アクション群）。
  header: ReactNode;
  children: ReactNode;
};

// 全ツール共通のシェル。デスクトップは常設サイドバー、モバイルはヘッダの
// メニューから開く Drawer に同じ内容を出す。ツール切替とプロジェクト履歴は
// ここに集約し、各スタジオのヘッダは作業中プロジェクトの操作に絞る。
export const StudioShell: FC<StudioShellProps> = ({
  header,
  children,
  ...sidebar
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = (): void => {
    setMenuOpen(false);
  };

  return (
    <div className="flex min-h-0 flex-1">
      <aside className="bg-bg-subtle border-border-mute hidden w-60 shrink-0 flex-col border-r lg:flex">
        <div className="px-5 pt-4 pb-1">
          <Link className="text-fg-base text-sm font-bold" href="/">
            k8o AI Studio
          </Link>
        </div>
        <SidebarContent {...sidebar} />
      </aside>

      <Drawer
        isOpen={menuOpen}
        onClose={closeMenu}
        side="left"
        title="k8o AI Studio"
      >
        {/* 閉じている間は描画しない。常設サイドバーと同じ内容が DOM に二重に
            存在すると、支援技術・テストの双方でランドマークが重複するため。 */}
        {menuOpen ? (
          <SidebarContent
            {...sidebar}
            onNewProject={() => {
              closeMenu();
              sidebar.onNewProject();
            }}
            onSelectProject={(projectId) => {
              closeMenu();
              sidebar.onSelectProject(projectId);
            }}
          />
        ) : null}
      </Drawer>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="border-border-mute flex flex-wrap items-center gap-x-4 gap-y-2 border-b px-4 py-2">
          <div className="lg:hidden">
            <IconButton
              color="transparent"
              label="メニューを開く"
              onClick={() => {
                setMenuOpen(true);
              }}
              size="sm"
            >
              <NavigationMenuIcon size="sm" />
            </IconButton>
          </div>
          {header}
        </header>
        {children}
      </div>
    </div>
  );
};
