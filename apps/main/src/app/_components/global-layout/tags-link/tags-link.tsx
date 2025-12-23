'use client';

import { TagIcon } from '@k8o/arte-odyssey/icons';
import { LinkButton } from '@k8o/arte-odyssey/link-button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { FC } from 'react';

export const TagsLink: FC<{
  onNavigate?: () => void;
}> = (props) => {
  const pathname = usePathname();
  return (
    <LinkButton
      active={pathname.startsWith('/tags')}
      href="/tags"
      renderAnchor={(anchorProps) => <Link {...anchorProps} {...props} />}
      startIcon={<TagIcon />}
      variant="skeleton"
    >
      タグ置き場
    </LinkButton>
  );
};
