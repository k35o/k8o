'use client';

/* oxlint-disable react/iframe-missing-sandbox -- 別オリジン(本番は *.vercel.run)のプレビュー。allow-same-origin は vite の動作に要るが、ホストとは別オリジンのため親ページへの脱出は起きない */

import { type FC, useEffect, useRef, useState } from 'react';

type ThemedPreviewIframeProps = {
  url: string;
  theme?: string | undefined;
  title: string;
};

// 生成プレビューの iframe。初期テーマは src(?theme) に載せて初回ペイントから正しい配色にし、
// 以降の切替は postMessage で反映する（src を変えると iframe がリロードされ白フラッシュするため）。
// studio（編集中）と公開共有ページの双方が使う。
export const ThemedPreviewIframe: FC<ThemedPreviewIframeProps> = ({
  url,
  theme,
  title,
}) => {
  const ref = useRef<HTMLIFrameElement>(null);
  const [initialSrc] = useState(() =>
    theme === 'dark' ? `${url}?theme=dark` : url,
  );

  useEffect(() => {
    ref.current?.contentWindow?.postMessage(
      { type: 'k8o-preview-theme', theme: theme === 'dark' ? 'dark' : 'light' },
      '*',
    );
  }, [theme]);

  return (
    <iframe
      className="size-full border-0"
      ref={ref}
      sandbox="allow-scripts allow-same-origin"
      src={initialSrc}
      title={title}
    />
  );
};
