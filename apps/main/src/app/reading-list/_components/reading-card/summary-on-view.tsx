'use client';

import { Badge } from '@k8o/arte-odyssey';
import { useAsyncAction } from '@repo/react-hooks/use-async-action';
import { useEffect, useRef, useState } from 'react';
import type { FC } from 'react';

import { generateArticleSummary } from '@/features/reading-list/interface/article-actions';

import { ReadingCardSummary } from './summary';

// 未要約の記事用。カードがビューポートに入ったタイミングで一度だけ要約を生成し、
// 結果を DB に保存する（次回以降は SSR で即時表示される）。生成に失敗した記事は、
// 次にページが表示されたときに改めて生成を試みる
export const ReadingCardSummaryOnView: FC<{
  articleId: number;
  description: string | null;
}> = ({ articleId, description }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const { isPending, run } = useAsyncAction();
  const containerRef = useRef<HTMLDivElement>(null);
  // 同一マウント内での多重生成を防ぐ
  const requestedRef = useRef(false);

  useEffect(() => {
    if (summary !== null || requestedRef.current) {
      return undefined;
    }
    const el = containerRef.current;
    if (el === null) {
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting !== true || requestedRef.current) {
          return;
        }
        requestedRef.current = true;
        observer.disconnect();
        run(() => generateArticleSummary(articleId), {
          onSuccess: (result) => {
            if (result.summary !== undefined) {
              setSummary(result.summary);
            }
          },
        });
      },
      // 画面に入る少し手前で生成を始め、表示される頃には用意できているようにする
      { rootMargin: '200px' },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [summary, articleId, run]);

  if (summary !== null) {
    return <ReadingCardSummary summary={summary} />;
  }

  // 生成前: 元記事の説明文を見せつつ、進入で生成。生成中はラベルで知らせる
  return (
    <div className="flex flex-col gap-1" ref={containerRef}>
      {isPending && (
        <span className="self-start">
          <Badge size="sm" text="AI要約を生成中…" tone="info" />
        </span>
      )}
      {description !== null && (
        <p className="text-fg-mute text-sm">{description}</p>
      )}
    </div>
  );
};
