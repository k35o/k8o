'use client';

import {
  CopyIcon,
  IconButton,
  useClipboard,
  useToast,
} from '@k8o/arte-odyssey';
import type { FC } from 'react';

export const CopyMarkdownButton: FC<{ slug: string }> = ({ slug }) => {
  const { writeClipboard } = useClipboard();
  const { onOpen } = useToast();

  const handleCopy = () => {
    void fetch(`/blog/${slug}.md`)
      .then((res) => res.text())
      .then((text) => writeClipboard(text))
      .then(() => {
        onOpen('success', 'Markdownをコピーしました');
      });
  };

  return (
    <IconButton label="Markdownをコピー" onClick={handleCopy} size="sm">
      <CopyIcon size="sm" />
    </IconButton>
  );
};
