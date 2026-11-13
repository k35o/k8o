'use client';

import { IconButton } from '@k8ordo/ui';
import { BookmarkIcon } from '@k8ordo/ui/icons';
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
    <BookmarkIcon size="lg" />
  </IconButton>
);
