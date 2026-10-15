'use client';

import { BlogIcon, Button } from '@k8ordo/ui';
import type { Route } from 'next';
import Link from 'next/link';
import type { FC } from 'react';

export const BlogLinkButton: FC<{ slug: string }> = ({ slug }) => (
  <Button
    // next/link は onClick や ref に明示的な undefined を受けない
    // (exactOptionalPropertyTypes) ため、束は展開せず要るものだけ取り出す
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
