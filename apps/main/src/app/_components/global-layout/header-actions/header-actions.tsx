import { Suspense } from 'react';
import type { FC } from 'react';

import { ContactToMe } from '../../contact-to-me';
import { ToggleTheme } from '../../toggle-theme';
import { NotificationsLink } from '../notifications-link';

export const HeaderActions: FC = () => (
  <div className="flex items-center gap-1">
    <Suspense fallback={null}>
      <ContactToMe />
    </Suspense>
    <NotificationsLink />
    <ToggleTheme />
  </div>
);
