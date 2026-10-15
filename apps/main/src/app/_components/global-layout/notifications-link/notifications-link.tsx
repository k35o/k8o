'use client';

import { IconButton, SubscribeIcon } from '@k8ordo/ui';
import Link from 'next/link';
import type { FC } from 'react';

export const NotificationsLink: FC = () => (
  <IconButton
    label="通知"
    // next/link は onClick や ref に明示的な undefined を受けない
    // (exactOptionalPropertyTypes) ため、束は展開せず要るものだけ取り出す
    renderItem={({
      'aria-label': ariaLabel,
      className,
      children,
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
