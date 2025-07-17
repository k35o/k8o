'use client';

import { NewsIcon } from '@k8o/components/icons';
import { LinkButton } from '@k8o/components/link-button';
import { usePathname } from 'next/navigation';
import { FC } from 'react';

export const NewsLink: FC = () => {
  const pathname = usePathname();
  return (
    <LinkButton
      href="/news"
      startIcon={<NewsIcon />}
      variant="skeleton"
      active={pathname.startsWith('/news')}
    >
      お知らせ
    </LinkButton>
  );
};
