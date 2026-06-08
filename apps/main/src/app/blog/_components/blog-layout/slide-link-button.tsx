'use client';

import { Button, SlideIcon } from '@k8o/arte-odyssey';
import type { FC } from 'react';

export const SlideLinkButton: FC<{ href: string }> = ({ href }) => (
  <Button
    renderItem={({ className, children }) => (
      <a
        className={className}
        href={href}
        rel="noopener noreferrer"
        target="_blank"
      >
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
