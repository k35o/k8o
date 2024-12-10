'use client';

import { IconLink } from '@/components/icon-link';
import { Qiita, Zenn } from '@/components/icons';
import { Rss } from 'lucide-react';
import { FC } from 'react';

export const ExternalBlog: FC = () => {
  return (
    <div className="flex gap-4">
      <IconLink href="https://qiita.com/KokiSakano" bg="base">
        <Qiita title="Qiitaのアカウント" className="size-6" />
      </IconLink>
      <IconLink href="https://zenn.dev/kokisakano" bg="base">
        <Zenn title="Zennのアカウント" className="size-6" />
      </IconLink>
      <IconLink href="/blog/feed" bg="base" label="rss">
        <Rss className="size-6" />
      </IconLink>
    </div>
  );
};
