'use client';

import { Button, SlideIcon } from '@k8ordo/ui';
import type { FC } from 'react';

export const SlideLinkButton: FC<{ href: string }> = ({ href }) => (
  <Button
    renderItem={({ children, disabled: _disabled, type: _type, ...props }) => (
      <a href={href} rel="noopener noreferrer" target="_blank" {...props}>
        {children}
      </a>
    )}
    size="sm"
    startIcon={<SlideIcon size="sm" />}
    variant="outline"
  >
    スライドを見る
  </Button>
);
