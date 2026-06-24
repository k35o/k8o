'use client';

import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';

import { resolveShareEntryAction } from '@/features/share/interface/actions';

type SharePreviewProps = {
  slug: string;
  title: string;
};

// 公開ページのプレビュー。配信URL（Sandbox 起動を伴うことがある）を解決してから iframe を出す。
export const SharePreview = ({ slug, title }: SharePreviewProps) => {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await resolveShareEntryAction(slug);
      if (res === null) {
        setFailed(true);
        return;
      }
      setUrl(res.url);
    })();
  }, [slug]);

  if (failed) {
    return (
      <div className="text-fg-mute flex h-full items-center justify-center p-6 text-center text-sm">
        プレビューを表示できませんでした。
      </div>
    );
  }
  if (url === null) {
    return (
      <div className="text-fg-mute flex h-full items-center justify-center p-6 text-center text-sm motion-safe:animate-pulse">
        プレビューを準備しています…
      </div>
    );
  }
  return <ShareFrame title={title} url={url} />;
};

type ShareFrameProps = {
  url: string;
  title: string;
};

// 共有プレビューを閲覧者のテーマに追従させる。初期テーマは src(?theme) に載せて初回
// ペイントから正しい配色にし、以降の切替は postMessage で反映する（src を変えると iframe が
// リロードされ白フラッシュするため）。
const ShareFrame = ({ url, title }: ShareFrameProps) => {
  const { resolvedTheme } = useTheme();
  const ref = useRef<HTMLIFrameElement>(null);
  const [initialSrc] = useState(() =>
    resolvedTheme === 'dark' ? `${url}?theme=dark` : url,
  );

  useEffect(() => {
    ref.current?.contentWindow?.postMessage(
      {
        type: 'k8o-preview-theme',
        theme: resolvedTheme === 'dark' ? 'dark' : 'light',
      },
      '*',
    );
  }, [resolvedTheme]);

  // Sandbox 配信は別オリジン(*.vercel.run)で vite の動作に allow-same-origin が要る（親とは
  // 別オリジンのため脱出は起きない）。disk 配信(同一オリジン)は allow-scripts のみで完全隔離。
  const sandbox = url.startsWith('http')
    ? 'allow-scripts allow-same-origin'
    : 'allow-scripts';
  return (
    <iframe
      className="size-full border-0"
      ref={ref}
      sandbox={sandbox}
      src={initialSrc}
      title={title}
    />
  );
};
