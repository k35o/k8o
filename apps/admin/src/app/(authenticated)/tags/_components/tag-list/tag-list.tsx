'use client';

import {
  Badge,
  Button,
  Card,
  Dialog,
  Modal,
  TextField,
  useToast,
} from '@k8o/arte-odyssey';
import { useAsyncAction } from '@repo/react-hooks/use-async-action';
import { type ChangeEvent, type FC, useState } from 'react';

import { EmptyState } from '@/app/(authenticated)/_components';
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

      <Modal isOpen={renameOpen} onClose={closeRename}>
        <Dialog.Root>
          <Dialog.Header onClose={closeRename} title="タグ名の変更" />
          <Dialog.Content>
            <div className="flex flex-col gap-6">
              <TextField
                aria-label="新しいタグ名"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setName(e.target.value);
                }}
                size={28}
                value={name}
              />
              <div className="flex justify-end gap-3">
                <Button color="gray" onClick={closeRename} variant="outline">
                  キャンセル
                </Button>
                <Button
                  color="primary"
                  disabled={isPending}
                  onClick={handleRename}
                  variant="solid"
                >
                  {isPending ? '保存中...' : '保存'}
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Root>
      </Modal>

      <Modal
        isOpen={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
        }}
      >
        <Dialog.Root>
          <Dialog.Header
            onClose={() => {
              setDeleteOpen(false);
            }}
            title="タグの削除"
          />
          <Dialog.Content>
            <div className="flex flex-col gap-6">
              <p className="text-sm">「{tag.name}」を削除しますか？</p>
              <div className="flex justify-end gap-3">
                <Button
                  color="gray"
                  onClick={() => {
                    setDeleteOpen(false);
                  }}
                  variant="outline"
                >
                  キャンセル
                </Button>
                <Button
                  color="primary"
                  disabled={isPending}
                  onClick={handleDelete}
                  variant="solid"
                >
                  {isPending ? '削除中...' : '削除する'}
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Root>
      </Modal>
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
