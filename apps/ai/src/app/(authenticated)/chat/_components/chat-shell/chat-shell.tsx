'use client';

import { Drawer, IconButton, NavigationMenuIcon } from '@k8ordo/ui';
import Link from 'next/link';
import { useState } from 'react';
import type { FC, ReactNode } from 'react';

import type { ThreadListItem } from '@/features/agent/application/threads';

import { ChatSidebar } from './chat-sidebar';

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
    <div className="flex min-h-0 flex-1">
      <aside className="bg-bg-subtle border-border-mute hidden w-60 shrink-0 flex-col border-r lg:flex">
        <div className="px-5 pt-4 pb-1">
          <Link className="text-fg-base text-sm font-bold" href="/">
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

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="border-border-mute flex items-center gap-4 border-b px-4 py-2">
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
