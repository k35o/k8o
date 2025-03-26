'use client';

import { NewsIcon } from '@/components/icons';
import { LinkButton } from '@/components/link-button';
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
