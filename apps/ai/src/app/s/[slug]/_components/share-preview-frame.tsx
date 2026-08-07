'use client';

import { useTheme } from 'next-themes';
import type { FC } from 'react';

import { ThemedPreviewIframe } from '@/app/_components/preview-iframe';

// 配信URLが解決済みの iframe。テーマは next-themes がクライアントでしか
// 解決できないため、この一枚だけをクライアントに残す。
export const SharePreviewFrame: FC<{ url: string; title: string }> = ({
  url,
  title,
}) => {
  const { resolvedTheme } = useTheme();
  return <ThemedPreviewIframe theme={resolvedTheme} title={title} url={url} />;
};
