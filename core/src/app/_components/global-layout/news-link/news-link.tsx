'use client';

import { NewsIcon } from '@k8o/arte-odyssey/icons';
import { LinkButton } from '@k8o/arte-odyssey/link-button';
import Link from 'next/link';
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
      renderAnchor={(props) => <Link {...props} />}
    >
      お知らせ
    </LinkButton>
  );
};
