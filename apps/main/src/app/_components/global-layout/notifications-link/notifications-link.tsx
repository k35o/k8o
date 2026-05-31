'use client';

import { IconButton, SubscribeIcon } from '@k8o/arte-odyssey';
import Link from 'next/link';
import type { FC } from 'react';

export const NotificationsLink: FC = () => (
  <IconButton
    label="通知"
    renderItem={({
      className,
      children,
      'aria-label': ariaLabel,
      triggerProps,
    }) => (
      <Link
        aria-label={ariaLabel}
        className={className}
        href="/notifications"
        {...triggerProps}
      >
        {children}
      </Link>
    )}
  >
    <SubscribeIcon size="lg" />
  </IconButton>
);
