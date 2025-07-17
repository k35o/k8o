'use client';

import { Anchor } from '@k8o/components/anchor';
import { IconButton } from '@k8o/components/icon-button';
import { CopyIcon, RSSIcon } from '@k8o/components/icons';
import { useToast } from '@k8o/components/toast';
import { useClipboard } from '@k8o/hooks/clipboard';
import { FC } from 'react';

export const RssPanel: FC = () => {
  const { writeClipboard } = useClipboard();
  const { onOpen } = useToast();

  return (
    <div className="flex flex-col justify-center gap-6">
      <p className="text-fg-mute text-sm">
        RSSリーダーを使用してブログの更新情報を受け取ることができます。以下のURLをRSSリーダーに追加してください。
      </p>
      <div className="bg-bg-mute flex w-full items-center justify-between gap-2 rounded-md p-2">
        <p>https://k8o.me/blog/feed</p>
        <IconButton
          label="コピー"
          bg="base"
          onClick={() => {
            void writeClipboard('https://k8o.me/blog/feed').then(
              () => {
                onOpen('success', 'クリップボードにコピーしました');
              },
            );
          }}
        >
          <CopyIcon />
        </IconButton>
      </div>
      <Anchor href="/blog/feed">
        <span className="flex items-center gap-2">
          <RSSIcon size="sm" />
          <span>フィードを表示</span>
        </span>
      </Anchor>
    </div>
  );
};
