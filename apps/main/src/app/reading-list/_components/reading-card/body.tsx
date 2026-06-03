'use client';

import { Button } from '@k8o/arte-odyssey';
import { type FC, useState, useTransition } from 'react';

import { generateArticleSummary } from '@/features/reading-list/interface/article-actions';

// 本文（要約優先・無ければ説明文）と「AIで要約」ボタンを表示する。
// 要約が無い記事だけボタンを出し、押すと生成→その場で表示に反映する。
export const ReadingCardBody: FC<{
  articleId: number;
  description: string | null;
  initialSummary: string | null;
}> = ({ articleId, description, initialSummary }) => {
  const [summary, setSummary] = useState(initialSummary);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  const body = summary ?? description ?? undefined;

  const handleGenerate = () => {
    setError(undefined);
    startTransition(async () => {
      const result = await generateArticleSummary(articleId);
      if (result.error !== undefined) {
        setError(result.error);
      } else if (result.summary !== undefined) {
        setSummary(result.summary);
      }
    });
  };

  return (
    <>
      {body !== undefined && (
        <p className="text-fg-mute vertical:block vertical:max-block-[8em] vertical:overflow-hidden line-clamp-2 text-sm">
          {body}
        </p>
      )}
      {summary === null && (
        <div className="flex items-center gap-2">
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
            <span className="text-fg-error text-xs">{error}</span>
          )}
        </div>
      )}
    </>
  );
};
