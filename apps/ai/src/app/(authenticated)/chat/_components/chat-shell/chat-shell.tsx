'use client';

import { Drawer, IconButton, NavigationMenuIcon } from '@k8ordo/ui';
import Link from 'next/link';
import { useState } from 'react';
import type { FC, ReactNode } from 'react';

import type { ThreadListItem } from '@/features/agent/application/threads';

import { ChatSidebar } from './chat-sidebar';

import styles from './chat-shell.module.css';

type ChatShellProps = {
  threads: ThreadListItem[];
  currentThreadId: string;
  header: ReactNode;
  children: ReactNode;
};

export const ChatShell: FC<ChatShellProps> = ({
  threads,
  currentThreadId,
  header,
  children,
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
        <ChatSidebar currentThreadId={currentThreadId} threads={threads} />
      </aside>

      <Drawer
        isOpen={menuOpen}
        onClose={closeMenu}
        side="left"
        title="k8o AI Studio"
      >
        {/* 閉じている間は描画しない。常設のサイドバーと同じ内容が DOM に二重にあると、
            ランドマークが重複するため。 */}
        {menuOpen ? (
          <ChatSidebar
            currentThreadId={currentThreadId}
            onNavigate={closeMenu}
            threads={threads}
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
