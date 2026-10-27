'use client';

import { CopyButton } from '@k8ordo/ui';
import type { FC } from 'react';

export const CopyMarkdownButton: FC<{ slug: string }> = ({ slug }) => (
  <CopyButton
    iconOnly
    label="Markdownをコピー"
    size="md"
    value={async () => {
      const res = await fetch(`/blog/${slug}.md`);
      if (!res.ok) {
        throw new Error(`Failed to fetch markdown: ${res.status}`);
      }
      return res.text();
    }}
  />
);
