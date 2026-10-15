'use client';

import { Drawer, IconButton, NavigationMenuIcon } from '@k8ordo/ui';
import Link from 'next/link';
import { useState } from 'react';
import type { FC, ReactNode } from 'react';

import { SidebarContent } from './sidebar-content';
import type { SidebarContentProps } from './sidebar-content';

import styles from './studio-shell.module.css';

type StudioShellProps = Omit<SidebarContentProps, 'onNavigate'> & {
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
    <div className={styles.root}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <Link className={styles.brandLink} href="/">
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
            onNavigate={closeMenu}
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

      <div className={styles.main}>
        <header className={styles.header}>
          <div className={styles.menu}>
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
