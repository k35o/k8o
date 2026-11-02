'use client';

import { IconButton, RSSIcon } from '@k8ordo/ui';
import type { FC } from 'react';

export const RssLink: FC = () => (
  <IconButton
    color="base"
    label="RSSフィード"
    renderItem={({
      children,
      disabled: _disabled,
      triggerProps,
      type: _type,
      ...props
    }) => (
      <a
        href="/reading-list/feed"
        rel="noopener noreferrer"
        target="_blank"
        {...props}
        {...triggerProps}
      >
        {children}
      </a>
    )}
  >
    <RSSIcon />
  </IconButton>
);
