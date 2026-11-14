'use client';

import { href } from '@k8ordo/framework';
import { Button } from '@k8ordo/ui';
import { BookTextIcon } from '@k8ordo/ui/icons';
import type { FC } from 'react';

export const BlogLinkButton: FC<{ slug: string }> = ({ slug }) => (
  <Button
    renderItem={({ children, disabled: _disabled, type: _type, ...props }) => (
      <a href={href('/blog/:slug', { slug })} {...props}>
        {children}
      </a>
    )}
    size="sm"
    startIcon={<BookTextIcon size="sm" />}
  >
    ブログで解説を読む
  </Button>
);
