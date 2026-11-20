import { ExternalLinkIcon } from '@k8ordo/ui/icons';
import type { FC } from 'react';

import { navCurrentOf } from '../nav-current';
import { LAB } from '../site-destinations';

import styles from './lab-links.module.css';

/** Lab のパネルの中身。ヘッダーのナビとドックが同じものを描く */
export const LabLinks: FC<{
  pathname: string;
  onNavigate: () => void;
}> = ({ pathname, onNavigate }) => (
  <>
    <p className={styles.caption}>触って遊べる、小さな実験。</p>
    <ul className={styles.list}>
      {LAB.map(({ label, path, description, icon, external }) => (
        <li key={path}>
          <a
            aria-current={navCurrentOf(pathname, path)}
            className={styles.link}
            href={path}
            onClick={onNavigate}
          >
            <span className={styles.icon}>{icon}</span>
            <span className={styles.text}>
              <span className={styles.label}>
                {label}
                {external && <ExternalLinkIcon size="xs" />}
              </span>
              <span className={styles.description}>{description}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  </>
);
