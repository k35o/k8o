import { Badge, Button } from '@k8o/arte-odyssey';
import type { FC } from 'react';

type ShareControlViewProps = {
  isPublic: boolean;
  // 公開中だが作業版が公開版より進んでいる（再公開で反映できる）。
  hasDraft: boolean;
  busy: boolean;
  onPublish: () => void;
  onCopy: () => void;
  onUnpublish: () => void;
};

// 共有操作の presentational 部分（IO は ShareControl コンテナが持つ）。先頭に現在の公開状態
// バッジ（公開中/非公開）を出して状態を明示し、続けて操作ボタンを置く。
export const ShareControlView: FC<ShareControlViewProps> = ({
  isPublic,
  hasDraft,
  busy,
  onPublish,
  onCopy,
  onUnpublish,
}) => {
  if (!isPublic) {
    return (
      <div className="flex items-center gap-2">
        <Badge size="sm" text="非公開" tone="neutral" variant="outline" />
        <Button
          color="primary"
          disabled={busy}
          onAction={onPublish}
          size="sm"
          variant="solid"
        >
          {busy ? '公開中…' : '公開'}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge size="sm" text="公開中" tone="success" variant="solid" />
      {hasDraft ? (
        <span className="text-fg-mute hidden text-xs sm:inline">
          未公開の変更あり
        </span>
      ) : null}
      <Button
        color={hasDraft ? 'primary' : 'gray'}
        disabled={busy}
        onAction={onPublish}
        size="sm"
        variant={hasDraft ? 'solid' : 'outline'}
      >
        {busy ? '更新中…' : '更新'}
      </Button>
      <Button color="gray" onAction={onCopy} size="sm" variant="outline">
        リンク
      </Button>
      <Button
        color="gray"
        disabled={busy}
        onAction={onUnpublish}
        size="sm"
        variant="outline"
      >
        非公開
      </Button>
    </div>
  );
};
