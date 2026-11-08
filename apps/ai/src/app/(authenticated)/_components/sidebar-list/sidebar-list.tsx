import Link from 'next/link';
import type { FC, ReactNode } from 'react';

import { UpdatedAt } from '../updated-at';

import styles from './sidebar-list.module.css';

// 開いた時点で今の項目が一覧の下のほうにあっても見えるよう、見える位置へ寄せる
const revealCurrent = (element: HTMLAnchorElement | null): void => {
  element?.scrollIntoView({ block: 'nearest' });
};

export type SidebarListEntry = {
  id: string;
  title: string;
  updatedAt: string;
  titleBadge?: ReactNode;
  metaBadge?: ReactNode;
  onNavigate?: (() => void) | undefined;
};

type SidebarListProps = {
  basePath: '/chat' | '/artifacts';
  entries: SidebarListEntry[];
  currentId: string | null;
  emptyText: string;
};

export const SidebarList: FC<SidebarListProps> = ({
  basePath,
  entries,
  currentId,
  emptyText,
}) => {
  if (entries.length === 0) {
    return <p className={styles.empty}>{emptyText}</p>;
  }

  return (
    <ul className={styles.root}>
      {entries.map((entry) => {
        const isCurrent = entry.id === currentId;
        return (
          <li key={entry.id}>
            <Link
              aria-current={isCurrent ? 'page' : undefined}
              className={styles.link}
              href={`${basePath}/${entry.id}`}
              onNavigate={() => {
                entry.onNavigate?.();
              }}
              ref={isCurrent ? revealCurrent : undefined}
            >
              <span className={styles.head}>
                <span className={styles.title}>{entry.title}</span>
                {entry.titleBadge}
              </span>
              <span className={styles.meta}>
                <UpdatedAt dateTime={entry.updatedAt} />
                {entry.metaBadge}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};
