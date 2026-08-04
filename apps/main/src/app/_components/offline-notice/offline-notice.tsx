'use client';

import { useOffline } from 'next/offline';
import type { FC } from 'react';

import { OfflineNoticeAlert } from './offline-notice-alert';

export const OfflineNotice: FC = () => {
  const isOffline = useOffline();

  if (!isOffline) {
    return null;
  }

  return <OfflineNoticeAlert />;
};
