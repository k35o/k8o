'use client';

import type { FC } from 'react';

import { ButtonLink } from '@/app/(authenticated)/_components';

export const AddSourceLink: FC = () => (
  <ButtonLink
    color="primary"
    href="/reading-list/sources/new"
    size="sm"
    variant="solid"
  >
    追加
  </ButtonLink>
);
