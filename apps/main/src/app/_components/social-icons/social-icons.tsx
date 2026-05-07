'use client';

import {
  GitHubIcon,
  IconButton,
  QiitaIcon,
  TwitterIcon,
} from '@k8o/arte-odyssey';
import type { FC } from 'react';

export const SocialIcons: FC = () => (
  <>
    <IconButton
      label="Xのアカウント"
      renderItem={({
        className,
        children,
        'aria-label': ariaLabel,
        triggerProps,
      }) => (
        <a
          aria-label={ariaLabel}
          className={className}
          href="https://x.com/k8ome"
          rel="noopener noreferrer"
          target="_blank"
          {...triggerProps}
        >
          {children}
        </a>
      )}
    >
      <TwitterIcon />
    </IconButton>
    <IconButton
      label="GitHubのアカウント"
      renderItem={({
        className,
        children,
        'aria-label': ariaLabel,
        triggerProps,
      }) => (
        <a
          aria-label={ariaLabel}
          className={className}
          href="https://github.com/k35o"
          rel="noopener noreferrer"
          target="_blank"
          {...triggerProps}
        >
          {children}
        </a>
      )}
    >
      <GitHubIcon />
    </IconButton>
    <IconButton
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
  </>
);
