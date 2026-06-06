'use client';

import { Button } from '@k8o/arte-odyssey';
import Link from 'next/link';
import type { FC } from 'react';

export const AddTalkLink: FC = () => (
  <Button
    color="primary"
    renderItem={({ className, children }) => (
      <Link className={className} href="/talks/new">
        {children}
      </Link>
    )}
    size="sm"
    variant="solid"
  >
    トークを追加
  </Button>
);
