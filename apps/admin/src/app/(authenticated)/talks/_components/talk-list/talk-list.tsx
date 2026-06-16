'use client';

import { Badge, Button, Card, useToast } from '@k8o/arte-odyssey';
import { formatDate } from '@repo/helpers/date/format';
import { useAsyncAction } from '@repo/react-hooks/use-async-action';
import type { Route } from 'next';
import { type FC, useState } from 'react';

import {
  ButtonLink,
  ConfirmDialog,
  EmptyState,
} from '@/app/(authenticated)/_components';
import { deleteTalk } from '@/features/talks/interface/actions';
import type { TalkRecord } from '@/features/talks/interface/queries';

const TalkRow: FC<{ talk: TalkRecord }> = ({ talk }) => {
  const [open, setOpen] = useState(false);
  const { isPending, run } = useAsyncAction();
  const { onOpen } = useToast();

  const handleDelete = (): void => {
    run(() => deleteTalk(talk.id), {
      onError: (message) => {
        onOpen('error', message);
      },
      onSuccess: () => {
        setOpen(false);
        onOpen('success', 'トークを削除しました');
      },
    });
  };

  return (
    <div className="border-border-mute flex flex-col gap-2 border-b px-5 py-4 text-sm last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <a
          className="min-w-0 font-medium hover:underline"
          href={talk.eventUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          {talk.title}
        </a>
        <div className="flex shrink-0 items-center gap-1">
          <ButtonLink
            color="gray"
            href={`/talks/${String(talk.id)}` as Route}
            size="sm"
            variant="skeleton"
          >
            編集
          </ButtonLink>
          <Button
            color="gray"
            onClick={() => {
              setOpen(true);
            }}
            size="sm"
            variant="skeleton"
          >
            削除
          </Button>
        </div>
      </div>

      <div className="text-fg-mute flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        <span>{talk.eventName}</span>
        {talk.eventLocation !== null && <span>・ {talk.eventLocation}</span>}
        <span>・ {formatDate(new Date(talk.eventDate))}</span>
      </div>

      {talk.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {talk.tags.map((tag) => (
            <Badge key={tag} size="sm" text={tag} tone="neutral" />
          ))}
        </div>
      )}

      <ConfirmDialog
        confirmLabel="削除する"
        isOpen={open}
        isPending={isPending}
        onClose={() => {
          setOpen(false);
        }}
        onConfirm={handleDelete}
        pendingLabel="削除中..."
        title="トークの削除"
      >
        <p className="text-sm">「{talk.title}」を削除しますか？</p>
      </ConfirmDialog>
    </div>
  );
};

export const TalkList: FC<{ talks: TalkRecord[] }> = ({ talks }) => {
  if (talks.length === 0) {
    return <EmptyState message="トークがありません" />;
  }

  return (
    <Card appearance="shadow">
      {talks.map((talk) => (
        <TalkRow key={talk.id} talk={talk} />
      ))}
    </Card>
  );
};
