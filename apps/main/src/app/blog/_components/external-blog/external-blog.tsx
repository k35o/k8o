import { IconButton, QiitaIcon, RSSIcon } from '@k8o/arte-odyssey';
import type { FC } from 'react';

export const ExternalBlog: FC = () => (
  <div className="flex gap-4">
    <IconButton
      bg="base"
      label="Qiitaのアカウント"
      renderItem={({
        className,
        children,
        'aria-label': ariaLabel,
        triggerProps,
      }) => (
        <a
          aria-label={ariaLabel}
          className={className}
          href="https://qiita.com/k8o"
          rel="noopener noreferrer"
          target="_blank"
          {...triggerProps}
        >
          {children}
        </a>
      )}
    >
      <QiitaIcon />
    </IconButton>
    <IconButton
      bg="base"
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
          href="/blog/feed"
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
  </div>
);
