'use client';

import type { FC } from 'react';

import { ButtonLink } from '@/app/(authenticated)/_components';

export const AddTalkLink: FC = () => (
  <ButtonLink color="primary" href="/talks/new" size="sm" variant="solid">
    トークを追加
  </ButtonLink>
);
