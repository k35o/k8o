'use client';

import { Badge, Button, Card, TextField, useToast } from '@k8o/arte-odyssey';
import { useAsyncAction } from '@repo/react-hooks/use-async-action';
import { useState } from 'react';
import type { ChangeEvent, FC } from 'react';

import { ConfirmDialog, EmptyState } from '@/app/(authenticated)/_components';
import { deleteTag, renameTag } from '@/features/tags/interface/actions';
import type { TagWithUsage } from '@/features/tags/interface/queries';

const TagRow: FC<{ tag: TagWithUsage }> = ({ tag }) => {
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [name, setName] = useState(tag.name);
  const { isPending, run } = useAsyncAction();
  const { onOpen } = useToast();

  const handleRename = (): void => {
    run(() => renameTag(tag.id, name), {
      onError: (message) => {
        onOpen('error', message);
      },
      onSuccess: () => {
        setRenameOpen(false);
        onOpen('success', 'タグ名を更新しました');
      },
    });
  };

  const handleDelete = (): void => {
    run(() => deleteTag(tag.id), {
      onError: (message) => {
        onOpen('error', message);
      },
      onSuccess: () => {
        setDeleteOpen(false);
        onOpen('success', 'タグを削除しました');
      },
    });
  };

  const closeRename = (): void => {
    setRenameOpen(false);
    setName(tag.name);
  };

  return (
    <div className="border-border-mute flex items-center gap-3 border-b px-5 py-4 text-sm last:border-b-0">
      <span className="min-w-0 flex-1 truncate font-medium">{tag.name}</span>
      <span className="text-fg-mute hidden shrink-0 text-xs sm:block">
        ブログ {tag.blogCount}・トーク {tag.talkCount}・スライド{' '}
        {tag.slideCount}
      </span>
      <Badge
        size="sm"
        text={`計 ${String(tag.total)}`}
        tone={tag.total > 0 ? 'neutral' : 'warning'}
      />
      <Button
        color="gray"
        onClick={() => {
          setRenameOpen(true);
        }}
        size="sm"
        variant="skeleton"
      >
        名前変更
      </Button>
      <Button
        color="gray"
        disabled={tag.total > 0}
        onClick={() => {
          setDeleteOpen(true);
        }}
        size="sm"
        variant="skeleton"
      >
        削除
      </Button>

      <ConfirmDialog
        confirmLabel="保存"
        isOpen={renameOpen}
        isPending={isPending}
        onClose={closeRename}
        onConfirm={handleRename}
        pendingLabel="保存中..."
        title="タグ名の変更"
      >
        <TextField
          aria-label="新しいタグ名"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setName(e.target.value);
          }}
          size={28}
          value={name}
        />
      </ConfirmDialog>

      <ConfirmDialog
        confirmLabel="削除する"
        isOpen={deleteOpen}
        isPending={isPending}
        onClose={() => {
          setDeleteOpen(false);
        }}
        onConfirm={handleDelete}
        pendingLabel="削除中..."
        title="タグの削除"
      >
        <p className="text-sm">「{tag.name}」を削除しますか？</p>
      </ConfirmDialog>
    </div>
  );
};

export const TagList: FC<{ tags: TagWithUsage[] }> = ({ tags }) => {
  if (tags.length === 0) {
    return <EmptyState message="タグがありません" />;
  }

  return (
    <Card appearance="shadow">
      {tags.map((tag) => (
        <TagRow key={tag.id} tag={tag} />
      ))}
    </Card>
  );
};
