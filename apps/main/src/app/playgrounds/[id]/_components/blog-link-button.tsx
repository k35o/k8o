'use client';

import { BlogIcon, Button } from '@k8o/arte-odyssey';
import type { Route } from 'next';
import Link from 'next/link';
import type { FC } from 'react';

export const BlogLinkButton: FC<{ slug: string }> = ({ slug }) => (
  <Button
    renderItem={({ className, children }) => (
      <Link className={className} href={`/blog/${slug}` as Route}>
        {children}
      </Link>
    )}
    size="sm"
    startIcon={<BlogIcon size="sm" />}
  >
    ブログで解説を読む
  </Button>
);
