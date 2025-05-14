'use client';

import { TagIcon } from '@/components/icons';
import { LinkButton } from '@/components/link-button';
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
    >
      タグ置き場
    </LinkButton>
  );
};
