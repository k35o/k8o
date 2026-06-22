/* oxlint-disable react/iframe-missing-sandbox -- 別オリジン(ローカルは localhost:5199、本番は別サブドメイン)のプレビュー。Vite/プレビューの動作に allow-same-origin が要るが、ホストとは別オリジンのため親ページへの脱出は起きない */

import type { FC } from 'react';

type PreviewFrameProps = {
  url: string;
  theme?: string | undefined;
};

// プレビュー iframe。最新を表示し直すときは親で key を変えて再マウントする。
// theme はアプリのテーマを渡し、プレビュー側で .dark を切り替える。
export const PreviewFrame: FC<PreviewFrameProps> = ({ url, theme }) => (
  <iframe
    className="size-full border-0"
    sandbox="allow-scripts allow-same-origin"
    src={theme === 'dark' ? `${url}?theme=dark` : url}
    title="preview"
  />
);
