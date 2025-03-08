'use client';

import { IconLink } from '@/components/icon-link';
import { QiitaIcon, RSSIcon, ZennIcon } from '@/components/icons';
import { FC } from 'react';

export const ExternalBlog: FC = () => {
  return (
    <div className="flex gap-4">
      <IconLink href="https://qiita.com/KokiSakano" bg="base">
        <span className="sr-only">Qiitaのアカウント</span>
        <QiitaIcon />
      </IconLink>
      <IconLink href="https://zenn.dev/kokisakano" bg="base">
        <span className="sr-only">Zennのアカウント</span>
        <ZennIcon />
      </IconLink>
      <IconLink href="/blog/feed" bg="base" label="rss">
        <span className="sr-only">RSSフィード</span>
        <RSSIcon />
      </IconLink>
    </div>
  );
};
