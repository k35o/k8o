import { Button, PlusIcon } from '@k8ordo/ui';
import { SignOutButton } from '@repo/auth-shell/sign-out-button';
import Link from 'next/link';
import type { FC } from 'react';

import { ToggleTheme } from '@/app/_components/toggle-theme';
import type { ThreadListItem } from '@/features/agent/application/threads';

import { ToolNav } from '../../../_components/tool-nav';
import { ThreadList } from '../thread-list';

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
  <div className="flex h-full min-h-0 flex-col">
    <div className="flex flex-col gap-3 px-3 pt-3">
      <Button
        color="primary"
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
    <p className="text-fg-mute px-5 pt-5 pb-1 text-xs font-bold">履歴</p>
    <div className="min-h-0 flex-1 overflow-y-auto">
      <ThreadList
        currentThreadId={currentThreadId}
        onNavigate={onNavigate}
        threads={threads}
      />
    </div>
    <div className="flex items-center justify-between px-4 py-3">
      <SignOutButton />
      <ToggleTheme />
    </div>
  </div>
);
