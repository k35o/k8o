import { Suspense } from 'react';
import type { FC } from 'react';

import { ContactToMe } from '../../contact-to-me';
import { ToggleTheme } from '../../toggle-theme';
import { NotificationsLink } from '../notifications-link';

import styles from './header-actions.module.css';

export const HeaderActions: FC = () => (
  <div className={styles.root}>
    <Suspense fallback={null}>
      <ContactToMe />
    </Suspense>
    <NotificationsLink />
    <ToggleTheme />
  </div>
);
