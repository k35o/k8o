'use client';

import { Button } from '@k8o/arte-odyssey';
import Link from 'next/link';
import type { FC } from 'react';

export const AddSourceLink: FC = () => (
  <Button
    color="primary"
    renderItem={({ className, children }) => (
      <Link className={className} href="/reading-list/sources/new">
        {children}
      </Link>
    )}
    size="sm"
    variant="solid"
  >
    追加
  </Button>
);
