import type { FC } from 'react';

import { ContactToMe } from '../../contact-to-me/contact-to-me';
import { ToggleTheme } from '../../toggle-theme/toggle-theme';
import { NotificationsLink } from '../notifications-link/notifications-link';

import styles from './header-actions.module.css';

export const HeaderActions: FC = () => (
  <div className={styles.root}>
    <ContactToMe />
    <NotificationsLink />
    <ToggleTheme />
  </div>
);
