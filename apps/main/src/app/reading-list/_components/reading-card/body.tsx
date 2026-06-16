'use client';

import { Button } from '@k8o/arte-odyssey';
import { useAsyncAction } from '@repo/react-hooks/use-async-action';
import {
  type FC,
  type RefObject,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import { generateArticleSummary } from '@/features/reading-list/interface/article-actions';

const CLAMP_CLASS =
  'vertical:block vertical:max-block-[8em] vertical:overflow-hidden line-clamp-2';

const useIsClamped = (
  enabled: boolean,
  body: string | undefined,
): [RefObject<HTMLParagraphElement | null>, boolean] => {
  const ref = useRef<HTMLParagraphElement>(null);
  const [isClamped, setIsClamped] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (el === null || !enabled) {
      return undefined;
    }
    const measure = (): void => {
      setIsClamped(el.scrollHeight > el.clientHeight);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [enabled, body]);

  return [ref, isClamped];
};

export const ReadingCardBody: FC<{
  articleId: number;
  description: string | null;
  initialSummary: string | null;
}> = ({ articleId, description, initialSummary }) => {
  const [summary, setSummary] = useState(initialSummary);
  const [expanded, setExpanded] = useState(false);
  const { isPending, error, run } = useAsyncAction();

  const body = summary ?? description ?? undefined;
  const [bodyRef, isClamped] = useIsClamped(!expanded, body);
  const bodyId = useId();

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
        <>
          <p
            aria-live="polite"
            className={`text-fg-mute text-sm ${expanded ? '' : CLAMP_CLASS}`}
            id={bodyId}
            ref={bodyRef}
          >
            {body}
          </p>
          {!expanded &&
            isClamped && (
              // カードを覆う overlay リンクより前面に出して、独立操作可能にする
              <button
                aria-controls={bodyId}
                // 展開後はボタン自体を消すため常に collapsed。disclosure として属性は明示する
                aria-expanded={false}
                className="text-fg-mute hover:text-fg-base relative z-10 cursor-pointer self-start text-xs underline underline-offset-2"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setExpanded(true);
                }}
                type="button"
              >
                続きを読む
              </button>
            )}
        </>
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
