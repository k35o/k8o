'use client';

import { CopyIcon, IconButton, useClipboard, useToast } from '@k8ordo/ui';
import type { FC } from 'react';

export const CopyMarkdownButton: FC<{ slug: string }> = ({ slug }) => {
  const { writeClipboard } = useClipboard();
  const { open } = useToast();

  const handleCopy = async () => {
    try {
      const res = await fetch(`/blog/${slug}.md`);
      if (!res.ok) {
        throw new Error(`Failed to fetch markdown: ${res.status}`);
      }
      const text = await res.text();
      await writeClipboard(text);
      open('success', 'Markdownをコピーしました');
    } catch {
      open('error', 'Markdownのコピーに失敗しました');
    }
  };

  return (
    <IconButton
      label="Markdownをコピー"
      onClick={() => {
        void handleCopy();
      }}
      size="md"
    >
      <CopyIcon size="md" />
    </IconButton>
  );
};
