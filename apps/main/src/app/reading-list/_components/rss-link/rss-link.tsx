'use client';

import { IconButton, RSSIcon } from '@k8o/arte-odyssey';
import type { FC } from 'react';

export const RssLink: FC = () => (
  <IconButton
    color="base"
    label="RSSフィード"
    renderItem={({
      className,
      children,
      'aria-label': ariaLabel,
      triggerProps,
    }) => (
      <a
        aria-label={ariaLabel}
        className={className}
        href="/reading-list/feed"
        rel="noopener noreferrer"
        target="_blank"
        {...triggerProps}
      >
        {children}
      </a>
    )}
  >
    <RSSIcon />
  </IconButton>
);
