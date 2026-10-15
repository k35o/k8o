'use client';

import type { FC, ReactNode } from 'react';

import { useIsScrollingDown } from './use-is-scrolling-down';

import styles from './header.module.css';

export const Header: FC<{ children: ReactNode }> = ({ children }) => {
  const isScrollingDown = useIsScrollingDown();

  return (
    <header className={styles.root} data-scrolling-down={isScrollingDown}>
      <div className={styles.bar}>{children}</div>
    </header>
  );
};
