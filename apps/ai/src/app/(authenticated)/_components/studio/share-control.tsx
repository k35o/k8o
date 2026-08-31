'use client';

import { useClipboard, useToast } from '@k8ordo/ui';
import { useTransition } from 'react';
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
  const [busy, startTransition] = useTransition();
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

  const handlePublish = (): void => {
    startTransition(async () => {
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
      }
    });
  };

  const handleUnpublish = (): void => {
    startTransition(async () => {
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
      }
    });
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
      onPublish={handlePublish}
      onUnpublish={handleUnpublish}
    />
  );
};
