'use client';

import type { FC } from 'react';

import { ButtonLink } from '@/app/(authenticated)/_components';

export const AddArticleLink: FC = () => (
  <ButtonLink
    color="gray"
    href="/reading-list/articles/new"
    size="sm"
    variant="outline"
  >
    記事を追加
  </ButtonLink>
);
