'use client';

import { IconButton, SubscribeIcon } from '@k8ordo/ui';
import type { FC } from 'react';

export const NotificationsLink: FC = () => (
  <IconButton
    label="通知"
    renderItem={({
      children,
      disabled: _disabled,
      triggerProps,
      type: _type,
      ...props
    }) => (
      <a href="/notifications" {...props} {...triggerProps}>
        {children}
      </a>
    )}
  >
    <SubscribeIcon size="lg" />
  </IconButton>
);
