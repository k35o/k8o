'use client';

import { IconLink } from '@/app/_components/icon-link';
import { Qiita } from '@/app/_components/icons/qiita';
import { Zenn } from '@/app/_components/icons/zenn';
import { FC } from 'react';

export const ExternalBlog: FC = () => {
  return (
    <div className="flex gap-4">
      <IconLink href="https://qiita.com/KokiSakano">
        <Qiita title="Qiitaのアカウント" className="h-6 w-6" />
      </IconLink>
      <IconLink href="https://zenn.dev/kokisakano">
        <Zenn title="Zennのアカウント" className="h-6 w-6" />
      </IconLink>
    </div>
  );
};
