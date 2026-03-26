'use client';

import {
  CopyIcon,
  IconButton,
  useClipboard,
  useToast,
} from '@k8o/arte-odyssey';
import type { FC } from 'react';

export const CopyMarkdownUrlButton: FC<{ slug: string }> = ({ slug }) => {
  const { writeClipboard } = useClipboard();
  const { onOpen } = useToast();

  const handleCopy = () => {
    const url = `${window.location.origin}/blog/${slug}.md`;
    void writeClipboard(url).then(() => {
      onOpen('success', 'Markdown URLをコピーしました');
    });
  };

  return (
    <IconButton label="Markdown URLをコピー" onClick={handleCopy} size="sm">
      <CopyIcon size="sm" />
    </IconButton>
  );
};
