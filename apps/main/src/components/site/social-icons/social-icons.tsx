'use client';

import { IconButton } from '@k8ordo/ui';
import type { FC } from 'react';

import { GitHubIcon } from '@/components/site/brand-icons/github-icon';
import { QiitaIcon } from '@/components/site/brand-icons/qiita-icon';
import { TwitterIcon } from '@/components/site/brand-icons/twitter-icon';

export const SocialIcons: FC = () => (
  <>
    <IconButton
      label="Xのアカウント"
      renderItem={({
        children,
        disabled: _disabled,
        triggerProps,
        type: _type,
        ...props
      }) => (
        <a
          href="https://x.com/k8ome"
          rel="noopener noreferrer"
          target="_blank"
          {...props}
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
        children,
        disabled: _disabled,
        triggerProps,
        type: _type,
        ...props
      }) => (
        <a
          href="https://github.com/k35o"
          rel="noopener noreferrer"
          target="_blank"
          {...props}
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
  </>
);
