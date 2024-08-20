'use client';

import { IconLink } from '@/components/icon-link';
import { Qiita, Zenn } from '@/components/icons';
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
    </div>
  );
};
