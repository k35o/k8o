'use client';

import { Button, useClipboard, useToast } from '@k8o/arte-odyssey';
import { type FC, useState } from 'react';

import {
  publishProjectAction,
  unpublishProjectAction,
} from '@/features/share/interface/actions';

type ShareControlProps = {
  projectId: number | null;
  slug: string | null;
  isPublic: boolean;
  onChanged: () => void;
};

// 公開/非公開と共有リンクのコピー。公開は publish 時に本物ビルドが走るため数秒かかる。
export const ShareControl: FC<ShareControlProps> = ({
  projectId,
  slug,
  isPublic,
  onChanged,
}) => {
  const [busy, setBusy] = useState(false);
  const { writeClipboard } = useClipboard();
  const { onOpen } = useToast();

  if (projectId === null) {
    return null;
  }

  const copyLink = async (targetSlug: string): Promise<void> => {
    await writeClipboard(`${window.location.origin}/s/${targetSlug}`).catch(
      () => undefined,
    );
  };

  const handlePublish = async (): Promise<void> => {
    setBusy(true);
    const res = await publishProjectAction(projectId);
    setBusy(false);
    if (res === null) {
      onOpen('error', '公開に失敗しました');
      return;
    }
    onChanged();
    await copyLink(res.slug);
    onOpen('success', '公開しました。リンクをコピーしました');
  };

  const handleUnpublish = async (): Promise<void> => {
    setBusy(true);
    const ok = await unpublishProjectAction(projectId);
    setBusy(false);
    if (!ok) {
      onOpen('error', '非公開化に失敗しました');
      return;
    }
    onChanged();
    onOpen('success', '非公開にしました');
  };

  const handleCopy = async (): Promise<void> => {
    if (slug === null) {
      return;
    }
    await copyLink(slug);
    onOpen('success', 'リンクをコピーしました');
  };

  if (isPublic) {
    return (
      <div className="flex items-center gap-2">
        <Button color="gray" onAction={handleCopy} size="sm" variant="skeleton">
          リンク
        </Button>
        <Button
          color="gray"
          disabled={busy}
          onAction={handleUnpublish}
          size="sm"
          variant="skeleton"
        >
          非公開
        </Button>
      </div>
    );
  }

  return (
    <Button
      color="primary"
      disabled={busy}
      onAction={handlePublish}
      size="sm"
      variant="skeleton"
    >
      {busy ? '公開中…' : '公開'}
    </Button>
  );
};
