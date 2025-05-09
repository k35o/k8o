'use client';

import { IconLink } from '@/components/icon-link';
import {
  AIIcon,
  QiitaIcon,
  RSSIcon,
  ZennIcon,
} from '@/components/icons';
import { FC } from 'react';

export const ExternalBlog: FC = () => {
  return (
    <div className="flex gap-4">
      <IconLink
        href="https://qiita.com/KokiSakano"
        bg="base"
        label="Qiitaのアカウント"
      >
        <QiitaIcon />
      </IconLink>
      <IconLink
        href="https://zenn.dev/kokisakano"
        bg="base"
        label="Zennのアカウント"
      >
        <ZennIcon />
      </IconLink>
      <IconLink href="/llms.txt" bg="base" label="LLMS">
        <AIIcon />
      </IconLink>
      <IconLink href="/blog/feed" bg="base" label="RSSフィード">
        <RSSIcon />
      </IconLink>
    </div>
  );
};
