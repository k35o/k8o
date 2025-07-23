'use client';

import { TagIcon } from '@k8o/arte-odyssey/icons';
import { LinkButton } from '@k8o/arte-odyssey/link-button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FC } from 'react';

export const TagsLink: FC = () => {
  const pathname = usePathname();
  return (
    <LinkButton
      href="/tags"
      startIcon={<TagIcon />}
      variant="skeleton"
      active={pathname.startsWith('/tags')}
      renderAnchor={(props) => <Link {...props} />}
    >
      タグ置き場
    </LinkButton>
  );
};
