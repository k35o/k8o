'use client';

import { IconLink } from '@/components/icon-link';
import { Qiita } from '@/components/icons/qiita';
import { Zenn } from '@/components/icons/zenn';
import { FC } from 'react';

export const ExternalBlog: FC = () => {
  return (
    <div className="flex gap-4">
      <IconLink href="https://qiita.com/KokiSakano">
        <Qiita title="Qiitaのアカウント" className="size-6" />
      </IconLink>
      <IconLink href="https://zenn.dev/kokisakano">
        <Zenn title="Zennのアカウント" className="size-6" />
      </IconLink>
    </div>
  );
};
