'use client';

import { Anchor } from '@k8o/arte-odyssey/anchor';
import { Button } from '@k8o/arte-odyssey/button';
import { Dialog } from '@k8o/arte-odyssey/dialog';
import { Modal } from '@k8o/arte-odyssey/modal';
import { formatDate } from '@repo/helpers/date/format';
import { type FC, useState, useTransition } from 'react';
import { deleteArticle } from '../../_actions/article-actions';

type Article = {
  id: number;
  title: string;
  url: string;
  publishedAt: string;
  sourceName: string;
};

const DeleteCell: FC<{ id: number; title: string }> = ({ id, title }) => {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await deleteArticle(id);
    });
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
      <p className="py-8 text-center text-fg-mute text-sm">
        取得済みの記事はありません
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-border-base border-b">
            <th className="px-4 py-3 font-medium text-fg-mute">タイトル</th>
            <th className="px-4 py-3 font-medium text-fg-mute">ソース</th>
            <th className="px-4 py-3 font-medium text-fg-mute">公開日</th>
            <th className="px-4 py-3 font-medium text-fg-mute" />
          </tr>
        </thead>
        <tbody>
          {articles.map((article) => (
            <tr
              className="border-border-base border-b transition-colors hover:bg-bg-mute"
              key={article.id}
            >
              <td className="max-w-64 truncate px-4 py-3">
                <Anchor href={article.url} openInNewTab>
                  {article.title}
                </Anchor>
              </td>
              <td className="px-4 py-3 text-fg-mute">{article.sourceName}</td>
              <td className="px-4 py-3 text-fg-mute">
                {formatDate(new Date(article.publishedAt))}
              </td>
              <td className="px-4 py-3">
                <DeleteCell id={article.id} title={article.title} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
