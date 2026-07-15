'use client';

/* oxlint-disable react/iframe-missing-sandbox -- 別オリジン(本番は *.vercel.run)のプレビュー。allow-same-origin は vite の動作に要るが、ホストとは別オリジンのため親ページへの脱出は起きない。この安全性は「配信が別オリジン」という前提に依存するので、同一オリジン配信へ変える場合は sandbox 属性を見直すこと */

import { useEffect, useRef, useState } from 'react';
import type { FC } from 'react';

type ThemedPreviewIframeProps = {
  url: string;
  theme?: string | undefined;
  title: string;
  // 読み込み完了の通知（呼び出し側のローディング表示解除に使う）。
  onLoad?: (() => void) | undefined;
  // HMR でプレビューが差し替わったときの通知（iframe を再読込せずローディングを解除するため）。
  onUpdated?: (() => void) | undefined;
};

// 生成プレビューの iframe。初期テーマは src(?theme) に載せて初回ペイントから正しい配色にし、
// 以降の切替は postMessage で反映する（src を変えると iframe がリロードされ白フラッシュするため）。
// studio（編集中）と公開共有ページの双方が使う。
export const ThemedPreviewIframe: FC<ThemedPreviewIframeProps> = ({
  url,
  theme,
  title,
  onLoad,
  onUpdated,
}) => {
  const ref = useRef<HTMLIFrameElement>(null);
  // url は Sandbox の絶対URL。クエリは URL で安全に組み立て、postMessage の宛先も同オリジンに絞る。
  // oxlint-disable-next-line react/hook-use-state -- 初期化時に一度だけ算出する安定値で setter は不要
  const [{ initialSrc, origin }] = useState(() => {
    const parsed = new URL(url);
    if (theme === 'dark') {
      parsed.searchParams.set('theme', 'dark');
    }
    return { initialSrc: parsed.toString(), origin: parsed.origin };
  });

  useEffect(() => {
    ref.current?.contentWindow?.postMessage(
      { type: 'k8o-preview-theme', theme: theme === 'dark' ? 'dark' : 'light' },
      origin,
    );
  }, [theme, origin]);

  // プレビュー(Sandbox)からの「HMR で差し替わった」通知を受ける。送信元オリジンを検証する。
  useEffect(() => {
    if (onUpdated === undefined) {
      return undefined;
    }
    const handler = (event: MessageEvent<unknown>): void => {
      if (event.origin !== origin) {
        return;
      }
      const { data } = event;
      if (
        typeof data === 'object' &&
        data !== null &&
        'type' in data &&
        data.type === 'k8o-preview-updated'
      ) {
        onUpdated();
      }
    };
    window.addEventListener('message', handler);
    return () => {
      window.removeEventListener('message', handler);
    };
  }, [onUpdated, origin]);

  return (
    <iframe
      className="size-full border-0"
      onLoad={onLoad}
      ref={ref}
      sandbox="allow-scripts allow-same-origin"
      src={initialSrc}
      title={title}
    />
  );
};
