'use client';

import { usePathname } from '@k8ordo/framework';
import { FlaskIcon } from '@k8ordo/ui/icons';
import { useState } from 'react';
import type { FC } from 'react';

import { useIsScrollingDown } from '../header/use-is-scrolling-down';
import { LabLinks } from '../lab-links/lab-links';
import { navCurrentOf } from '../nav-current';
import { isInLab, LINKS } from '../site-destinations';
import { DockMenu } from './dock-menu';
import { DOCK_SLOT_ID } from './dock-slot';

import styles from './dock.module.css';

export const Dock: FC = () => {
  const pathname = usePathname();
  const isScrollingDown = useIsScrollingDown();
  const [isLabOpen, setIsLabOpen] = useState(false);

  return (
    <div className={styles.root} data-scrolling-down={isScrollingDown}>
      <nav aria-label="メイン" className={styles.nav}>
        <ul className={styles.list}>
          {LINKS.map(({ label, path, icon }) => (
            <li key={path}>
              <a
                aria-current={navCurrentOf(pathname, path)}
                className={styles.item}
                href={path}
              >
                {icon}
                {label}
              </a>
            </li>
          ))}
          <li className={styles.lab}>
            <DockMenu
              icon={<FlaskIcon size="md" />}
              isCurrent={isInLab(pathname, navCurrentOf)}
              isOpen={isLabOpen}
              label="Lab"
              onChange={setIsLabOpen}
            >
              <LabLinks
                onNavigate={() => {
                  setIsLabOpen(false);
                }}
                pathname={pathname}
              />
            </DockMenu>
          </li>
        </ul>
      </nav>
      <div className={styles.slot} id={DOCK_SLOT_ID} />
    </div>
  );
};
