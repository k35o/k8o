'use client';

import { Button } from '@k8o/arte-odyssey';
import { type FC, useState } from 'react';

import { generateArticleSummary } from '@/features/reading-list/interface/article-actions';
import { useAsyncAction } from '@/shared/hooks/use-async-action';

// 本文（要約優先・無ければ説明文）と「AIで要約」ボタンを表示する。
// 要約が無い記事だけボタンを出し、押すと生成→その場で表示に反映する。
export const ReadingCardBody: FC<{
  articleId: number;
  description: string | null;
  initialSummary: string | null;
}> = ({ articleId, description, initialSummary }) => {
  const [summary, setSummary] = useState(initialSummary);
  const { isPending, error, run } = useAsyncAction();

  const body = summary ?? description ?? undefined;

  const handleGenerate = () => {
    run(() => generateArticleSummary(articleId), {
      onSuccess: (result) => {
        if (result.summary !== undefined) {
          setSummary(result.summary);
        }
      },
    });
  };

  return (
    <>
      {body !== undefined && (
        <p
          aria-live="polite"
          className="text-fg-mute vertical:block vertical:max-block-[8em] vertical:overflow-hidden line-clamp-2 text-sm"
        >
          {body}
        </p>
      )}
      {summary === null && (
        // カードを覆う overlay リンクより前面に出して、ボタンを独立操作可能にする
        <div className="relative z-10 flex items-center gap-2">
          <Button
            color="gray"
            disabled={isPending}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleGenerate();
            }}
            size="sm"
            variant="skeleton"
          >
            {isPending ? '要約中…' : 'AIで要約'}
          </Button>
          {error !== undefined && (
            <span className="text-fg-error text-xs" role="alert">
              {error}
            </span>
          )}
        </div>
      )}
    </>
  );
};
