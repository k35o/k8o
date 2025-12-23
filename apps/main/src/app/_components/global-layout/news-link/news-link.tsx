'use client';

import { NewsIcon } from '@k8o/arte-odyssey/icons';
import { LinkButton } from '@k8o/arte-odyssey/link-button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { FC } from 'react';

export const NewsLink: FC<{
  onNavigate?: () => void;
}> = (props) => {
  const pathname = usePathname();
  return (
    <LinkButton
      active={pathname.startsWith('/news')}
      href="/news"
      renderAnchor={(anchorProps) => <Link {...anchorProps} {...props} />}
      startIcon={<NewsIcon />}
      variant="skeleton"
    >
      お知らせ
    </LinkButton>
  );
};
