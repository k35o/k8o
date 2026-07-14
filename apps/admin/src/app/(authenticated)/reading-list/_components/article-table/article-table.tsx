'use client';

import { Button, Card, useToast } from '@k8o/arte-odyssey';
import { formatDate } from '@repo/helpers/date/format';
import { useAsyncAction } from '@repo/react-hooks/use-async-action';
import type { Route } from 'next';
import { useState } from 'react';
import type { FC } from 'react';

import {
  ButtonLink,
  ConfirmDialog,
  EmptyState,
} from '@/app/(authenticated)/_components';
import {
  deleteArticle,
  refetchArticleMetadata,
} from '@/features/reading-list/interface/article-actions';

type Article = {
  id: number;
  title: string;
  url: string;
  publishedAt: string;
  sourceName: string;
};

const RefetchButton: FC<{ id: number }> = ({ id }) => {
  const { isPending, run } = useAsyncAction();
  const { onOpen } = useToast();

  const handleRefetch = (): void => {
    run(() => refetchArticleMetadata(id), {
      onError: (message) => {
        onOpen('error', message);
      },
      onSuccess: () => {
        onOpen('success', 'OGP を再取得しました');
      },
    });
  };

  return (
    <Button
      color="gray"
      disabled={isPending}
      onClick={handleRefetch}
      size="sm"
      variant="skeleton"
    >
      {isPending ? '取得中...' : 'OGP再取得'}
    </Button>
  );
};

const DeleteButton: FC<{ id: number; title: string }> = ({ id, title }) => {
  const [open, setOpen] = useState(false);
  const { isPending, error, run } = useAsyncAction();

  const handleDelete = (): void => {
    run(() => deleteArticle(id));
  };

  return (
    <>
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
      <ConfirmDialog
        confirmLabel="削除する"
        isOpen={open}
        isPending={isPending}
        onClose={() => {
          setOpen(false);
        }}
        onConfirm={handleDelete}
        pendingLabel="削除中..."
        title="取得済み記事の削除"
      >
        <p className="text-sm">「{title}」を削除しますか？</p>
        {error !== undefined && (
          <p className="text-fg-error text-sm">{error}</p>
        )}
      </ConfirmDialog>
    </>
  );
};

export const ArticleTable: FC<{ articles: Article[] }> = ({ articles }) => {
  if (articles.length === 0) {
    return <EmptyState message="取得済みの記事はありません" />;
  }

  return (
    <Card appearance="shadow">
      {articles.map((article) => (
        <div
          className="border-border-mute flex items-center gap-3 border-b px-5 py-4 text-sm last:border-b-0"
          key={article.id}
        >
          <a
            className="min-w-0 flex-1 truncate font-medium hover:underline"
            href={article.url}
            rel="noopener noreferrer"
            target="_blank"
          >
            {article.title}
          </a>
          <span className="text-fg-mute hidden shrink-0 text-xs sm:block">
            {article.sourceName}
          </span>
          <span className="text-fg-mute hidden w-28 shrink-0 text-right text-xs sm:block">
            {formatDate(new Date(article.publishedAt))}
          </span>
          <div className="flex shrink-0 items-center gap-1">
            <ButtonLink
              color="gray"
              href={`/reading-list/articles/${String(article.id)}` as Route}
              size="sm"
              variant="skeleton"
            >
              編集
            </ButtonLink>
            <RefetchButton id={article.id} />
            <DeleteButton id={article.id} title={article.title} />
          </div>
        </div>
      ))}
    </Card>
  );
};
