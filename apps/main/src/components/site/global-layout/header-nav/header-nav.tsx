'use client';

import { usePathname } from '@k8ordo/framework';
import { Popover } from '@k8ordo/ui';
import { ChevronIcon } from '@k8ordo/ui/icons';
import { useState } from 'react';
import type { FC } from 'react';

import { LabLinks } from '../lab-links/lab-links';
import { navCurrentOf } from '../nav-current';
import { isInLab, LINKS } from '../site-destinations';

import styles from './header-nav.module.css';

export const HeaderNav: FC = () => {
  const pathname = usePathname();
  const [isLabOpen, setIsLabOpen] = useState(false);

  return (
    <nav aria-label="メイン" className={styles.root}>
      <ul className={styles.list}>
        {LINKS.map(({ label, path }) => (
          <li key={path}>
            <a
              aria-current={navCurrentOf(pathname, path)}
              className={styles.link}
              href={path}
            >
              {label}
            </a>
          </li>
        ))}
        <li>
          <Popover.Root
            isOpen={isLabOpen}
            onChange={setIsLabOpen}
            placement="bottom-start"
            role="dialog"
          >
            <Popover.Trigger
              renderItem={(props) => (
                <button
                  {...props}
                  className={styles.link}
                  data-current={isInLab(pathname, navCurrentOf)}
                  type="button"
                >
                  Lab
                  <ChevronIcon direction="down" size="sm" />
                </button>
              )}
            />
            <Popover.Content
              renderItem={(props) => (
                <div {...props} aria-label="Lab" className={styles.panel}>
                  <LabLinks
                    onNavigate={() => {
                      setIsLabOpen(false);
                    }}
                    pathname={pathname}
                  />
                </div>
              )}
            />
          </Popover.Root>
        </li>
      </ul>
    </nav>
  );
};
