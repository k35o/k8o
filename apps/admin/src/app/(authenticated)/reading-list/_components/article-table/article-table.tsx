'use client';

import { Button, Dialog, Modal } from '@k8o/arte-odyssey';
import { formatDate } from '@repo/helpers/date/format';
import { type FC, useState, useTransition } from 'react';

import { deleteArticle } from '@/features/reading-list/interface/article-actions';

type Article = {
  id: number;
  title: string;
  url: string;
  publishedAt: string;
  sourceName: string;
};

const DeleteButton: FC<{ id: number; title: string }> = ({ id, title }) => {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  const handleDelete = () => {
    setError(undefined);
    startTransition(async () => {
      const result = await deleteArticle(id);
      if (result.error !== undefined) {
        setError(result.error);
      }
    });
  };

  return (
    <>
      <Button
        color="gray"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        size="sm"
        variant="skeleton"
      >
        削除
      </Button>
      <Modal
        isOpen={open}
        onClose={() => {
          setOpen(false);
        }}
      >
        <Dialog.Root>
          <Dialog.Header
            onClose={() => {
              setOpen(false);
            }}
            title="取得済み記事の削除"
          />
          <Dialog.Content>
            <div className="flex flex-col gap-6">
              <p className="text-sm">「{title}」を削除しますか？</p>
              {error !== undefined && (
                <p className="text-fg-error text-sm">{error}</p>
              )}
              <div className="flex justify-end gap-3">
                <Button
                  color="gray"
                  onClick={() => {
                    setOpen(false);
                  }}
                  variant="outlined"
                >
                  キャンセル
                </Button>
                <Button
                  color="primary"
                  disabled={isPending}
                  onClick={handleDelete}
                  variant="contained"
                >
                  {isPending ? '削除中...' : '削除する'}
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Root>
      </Modal>
    </>
  );
};

export const ArticleTable: FC<{ articles: Article[] }> = ({ articles }) => {
  if (articles.length === 0) {
    return (
      <p className="text-fg-mute py-12 text-center text-sm">
        取得済みの記事はありません
      </p>
    );
  }

  return (
    <div className="flex flex-col">
      {articles.map((article) => (
        <a
          className="border-border-base hover:bg-bg-mute flex items-center gap-3 border-b px-4 py-3 text-sm transition-colors"
          href={article.url}
          key={article.id}
          rel="noopener noreferrer"
          target="_blank"
        >
          <span className="min-w-0 flex-1 truncate font-medium">
            {article.title}
          </span>
          <span className="text-fg-mute hidden shrink-0 text-xs sm:block">
            {article.sourceName}
          </span>
          <span className="text-fg-mute hidden w-40 shrink-0 text-right sm:block">
            {formatDate(new Date(article.publishedAt))}
          </span>
          <DeleteButton id={article.id} title={article.title} />
        </a>
      ))}
    </div>
  );
};
