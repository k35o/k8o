'use client';

import { Button } from '@k8o/arte-odyssey';
import Link from 'next/link';
import type { FC } from 'react';

export const AddArticleLink: FC = () => (
  <Button
    color="gray"
    renderItem={({ className, children }) => (
      <Link className={className} href="/reading-list/articles/new">
        {children}
      </Link>
    )}
    size="sm"
    variant="outlined"
  >
    記事を追加
  </Button>
);
