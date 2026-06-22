'use client';

import { type FC, useEffect } from 'react';

const reportView = (slug: string): void => {
  const body = JSON.stringify({ slug });

  // 離脱・タブクローズ時でも送信が保証されやすい sendBeacon を優先する
  if (
    typeof navigator !== 'undefined' &&
    typeof navigator.sendBeacon === 'function'
  ) {
    const blob = new Blob([body], { type: 'application/json' });
    if (navigator.sendBeacon('/api/blog/views', blob)) {
      return;
    }
  }

  // フォールバック: ページ遷移中でも中断されにくいよう keepalive を付ける
  void fetch('/api/blog/views', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {
    // 計測の失敗は致命的ではないため握りつぶす
  });
};

export const ViewReporter: FC<{ slug: string }> = ({ slug }) => {
  useEffect(() => {
    reportView(slug);
  }, [slug]);

  return null;
};
