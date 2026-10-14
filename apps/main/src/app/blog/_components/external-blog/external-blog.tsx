'use client';

import { IconButton, QiitaIcon, RSSIcon } from '@k8ordo/ui';
import type { FC } from 'react';

export const ExternalBlog: FC = () => (
  <div className="flex gap-4">
    <IconButton
      color="base"
      label="Qiitaのアカウント"
      renderItem={({
        children,
        disabled: _disabled,
        triggerProps,
        type: _type,
        ...props
      }) => (
        <a
          href="https://qiita.com/k8o"
          rel="noopener noreferrer"
          target="_blank"
          {...props}
          {...triggerProps}
        >
          {children}
        </a>
      )}
    >
      <QiitaIcon />
    </IconButton>
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
          href="/blog/feed"
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
  </div>
);
