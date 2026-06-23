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
  // 公開中だが作業版が公開版より進んでいる（再公開で反映できる）。
  hasDraft: boolean;
  onChanged: () => void;
};

// 公開/非公開と共有リンクのコピー。公開は publish 時に本物ビルドが走るため数秒かかる。
export const ShareControl: FC<ShareControlProps> = ({
  projectId,
  slug,
  isPublic,
  hasDraft,
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
    try {
      const res = await publishProjectAction(projectId);
      if (res === null) {
        onOpen('error', '公開に失敗しました');
        return;
      }
      onChanged();
      await copyLink(res.slug);
      onOpen('success', '公開しました。リンクをコピーしました');
    } catch {
      // ビルド失敗（生成コードのビルドエラー等）でも busy を確実に解除する。
      onOpen('error', '公開に失敗しました');
    } finally {
      setBusy(false);
    }
  };

  const handleUnpublish = async (): Promise<void> => {
    setBusy(true);
    try {
      const ok = await unpublishProjectAction(projectId);
      if (!ok) {
        onOpen('error', '非公開化に失敗しました');
        return;
      }
      onChanged();
      onOpen('success', '非公開にしました');
    } catch {
      onOpen('error', '非公開化に失敗しました');
    } finally {
      setBusy(false);
    }
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
        {hasDraft ? (
          <span className="text-fg-mute hidden text-xs sm:inline">
            未公開の変更あり
          </span>
        ) : null}
        <Button
          color={hasDraft ? 'primary' : 'gray'}
          disabled={busy}
          onAction={handlePublish}
          size="sm"
          variant={hasDraft ? 'solid' : 'outline'}
        >
          {busy ? '更新中…' : '更新'}
        </Button>
        <Button color="gray" onAction={handleCopy} size="sm" variant="outline">
          リンク
        </Button>
        <Button
          color="gray"
          disabled={busy}
          onAction={handleUnpublish}
          size="sm"
          variant="outline"
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
      variant="solid"
    >
      {busy ? '公開中…' : '公開'}
    </Button>
  );
};
