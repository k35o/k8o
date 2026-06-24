/* oxlint-disable react/iframe-missing-sandbox -- 別オリジン(ローカルは localhost:5199、本番は別サブドメイン)のプレビュー。Vite/プレビューの動作に allow-same-origin が要るが、ホストとは別オリジンのため親ページへの脱出は起きない */

import { type FC, useEffect, useRef, useState } from 'react';

type PreviewFrameProps = {
  url: string;
  theme?: string | undefined;
};

// 最新を表示し直すときは親で key を変えて再マウントする。
// 初期テーマは src(?theme) に載せて初回ペイントから正しい配色にし、以降の切替は
// postMessage で反映する（src を変えると iframe がリロードされ白フラッシュするため）。
export const PreviewFrame: FC<PreviewFrameProps> = ({ url, theme }) => {
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
      title="preview"
    />
  );
};
