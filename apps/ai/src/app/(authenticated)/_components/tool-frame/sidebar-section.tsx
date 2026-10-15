'use client';

import { Button, PlusIcon } from '@k8ordo/ui';
import Link from 'next/link';
import type { FC, ReactNode } from 'react';

import { useSidebarMenu } from './sidebar-menu';

import styles from './sidebar-section.module.css';

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
    <div className={styles.root}>
      <div className={styles.actions}>
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
      <p className={styles.heading}>{heading}</p>
      <div className={styles.list}>{children}</div>
    </div>
  );
};
