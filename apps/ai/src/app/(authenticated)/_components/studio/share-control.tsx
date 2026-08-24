'use client';

import { useClipboard, useToast } from '@k8o/arte-odyssey';
import { useState } from 'react';
import type { FC } from 'react';

import {
  publishProjectAction,
  unpublishProjectAction,
} from '@/features/share/interface/actions';

import { ShareControlView } from './share-control-view';

type ShareControlProps = {
  projectId: number | null;
  slug: string | null;
  isPublic: boolean;
  // 公開中だが作業版が公開版より進んでいる（再公開で反映できる）。
  hasDraft: boolean;
  onChanged: () => void;
};

export const ShareControl: FC<ShareControlProps> = ({
  projectId,
  slug,
  isPublic,
  hasDraft,
  onChanged,
}) => {
  const [busy, setBusy] = useState(false);
  const { writeClipboard } = useClipboard();
  const { open } = useToast();

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
        open('error', '公開に失敗しました');
        return;
      }
      onChanged();
      await copyLink(res.slug);
      open('success', '公開しました。リンクをコピーしました');
    } catch {
      open('error', '公開に失敗しました');
    } finally {
      setBusy(false);
    }
  };

  const handleUnpublish = async (): Promise<void> => {
    setBusy(true);
    try {
      const ok = await unpublishProjectAction(projectId);
      if (!ok) {
        open('error', '非公開化に失敗しました');
        return;
      }
      onChanged();
      open('success', '非公開にしました');
    } catch {
      open('error', '非公開化に失敗しました');
    } finally {
      setBusy(false);
    }
  };

  const handleCopy = async (): Promise<void> => {
    if (slug === null) {
      return;
    }
    await copyLink(slug);
    open('success', 'リンクをコピーしました');
  };

  return (
    <ShareControlView
      busy={busy}
      hasDraft={hasDraft}
      isPublic={isPublic}
      onCopy={() => {
        void handleCopy();
      }}
      onPublish={() => {
        void handlePublish();
      }}
      onUnpublish={() => {
        void handleUnpublish();
      }}
    />
  );
};
