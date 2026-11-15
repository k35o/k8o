'use client';

import { Button } from '@k8ordo/ui';
import { PresentationIcon } from '@k8ordo/ui/icons';
import type { FC } from 'react';

export const SlideLinkButton: FC<{ href: string }> = ({ href }) => (
  <Button
    renderItem={({ children, disabled: _disabled, type: _type, ...props }) => (
      <a href={href} rel="noopener noreferrer" target="_blank" {...props}>
        {children}
      </a>
    )}
    size="sm"
    startIcon={<PresentationIcon size="sm" />}
    variant="outline"
  >
    スライドを見る
  </Button>
);
