'use client';

import { Button, PlusIcon } from '@k8ordo/ui';
import Link from 'next/link';
import type { FC, ReactNode } from 'react';

import { useSidebarMenu } from './sidebar-menu';

type SidebarSectionProps = {
  heading: string;
  newHref: '/' | '/slides' | '/chat';
  newLabel: string;
  children: ReactNode;
};

export const SidebarSection: FC<SidebarSectionProps> = ({
  heading,
  newHref,
  newLabel,
  children,
}) => {
  const { close } = useSidebarMenu();
  return (
    // スロットは DOM で包まれずにサイドバーの flex の直下に入るので、ここで残りの高さを取って一覧をスクロールさせる
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col px-3 pt-3">
        <Button
          color="primary"
          renderItem={({ className, children: label }) => (
            <Link className={className} href={newHref} onNavigate={close}>
              {label}
            </Link>
          )}
          size="sm"
          startIcon={<PlusIcon size="sm" />}
          variant="solid"
        >
          {newLabel}
        </Button>
      </div>
      <p className="text-fg-mute px-5 pt-5 pb-1 text-xs font-bold">{heading}</p>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
};
