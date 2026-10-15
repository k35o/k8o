import { Button, PlusIcon } from '@k8ordo/ui';
import { SignOutButton } from '@repo/auth-shell/sign-out-button';
import Link from 'next/link';
import type { FC } from 'react';

import { ToggleTheme } from '@/app/_components/toggle-theme';
import type { ThreadListItem } from '@/features/agent/application/threads';

import { ToolNav } from '../../../_components/tool-nav';
import { ThreadList } from '../thread-list';

import styles from './chat-sidebar.module.css';

type ChatSidebarProps = {
  threads: ThreadListItem[];
  currentThreadId: string;
  onNavigate?: (() => void) | undefined;
};

export const ChatSidebar: FC<ChatSidebarProps> = ({
  threads,
  currentThreadId,
  onNavigate,
}) => (
  <div className={styles.root}>
    <div className={styles.top}>
      <Button
        color="primary"
        // Next の Link は onClick / onMouseEnter / ref に undefined を受けないため、束を
        // そのまま広げられない。この Button は onClick も disabled も持たないので、
        // className と children だけ取り出せば捨てるものは無い
        renderItem={({ className, children }) => (
          <Link
            className={className}
            href="/chat"
            onNavigate={() => {
              onNavigate?.();
            }}
          >
            {children}
          </Link>
        )}
        size="sm"
        startIcon={<PlusIcon size="sm" />}
        variant="solid"
      >
        新しいチャット
      </Button>
      <ToolNav current="chat" onNavigate={onNavigate} />
    </div>
    <p className={styles.heading}>履歴</p>
    <div className={styles.list}>
      <ThreadList
        currentThreadId={currentThreadId}
        onNavigate={onNavigate}
        threads={threads}
      />
    </div>
    <div className={styles.footer}>
      <SignOutButton />
      <ToggleTheme />
    </div>
  </div>
);
