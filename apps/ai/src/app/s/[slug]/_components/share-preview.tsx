'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { ThemedPreviewIframe } from '@/app/_components/preview-iframe';
import { resolveShareEntryAction } from '@/features/share/interface/actions';

type SharePreviewProps = {
  slug: string;
  title: string;
};

// 公開ページのプレビュー。配信URL（Sandbox 起動を伴うことがある）を解決してから iframe を出す。
export const SharePreview = ({ slug, title }: SharePreviewProps) => {
  const { resolvedTheme } = useTheme();
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const res = await resolveShareEntryAction(slug);
        if (res === null) {
          setFailed(true);
          return;
        }
        setUrl(res.url);
      } catch {
        // server action が想定外に reject しても spinner で固まらせない。
        setFailed(true);
      }
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
  return <ThemedPreviewIframe theme={resolvedTheme} title={title} url={url} />;
};
