'use client';

import { TagIcon } from '@k8o/arte-odyssey/icons';
import { LinkButton } from '@k8o/arte-odyssey/link-button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { FC } from 'react';

export const TagsLink: FC = () => {
  const pathname = usePathname();
  return (
    <LinkButton
      active={pathname.startsWith('/tags')}
      href="/tags"
      renderAnchor={(props) => <Link {...props} href="/tags" />}
      startIcon={<TagIcon />}
      variant="skeleton"
    >
      タグ置き場
    </LinkButton>
  );
};
