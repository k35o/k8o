'use client';

import { Button } from '@k8o/arte-odyssey';
import {
  type FC,
  type RefObject,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import { generateArticleSummary } from '@/features/reading-list/interface/article-actions';
import { useAsyncAction } from '@/shared/hooks/use-async-action';

// 折りたたみ時のクランプ（横書きは2行、縦書きは block 方向 8em で省略）
const CLAMP_CLASS =
  'vertical:block vertical:max-block-[8em] vertical:overflow-hidden line-clamp-2';

// 本文がクランプで切り詰められているか（＝展開の余地があるか）を監視する。
// 展開中は計測しない。クランプ解除で scrollHeight === clientHeight になり
// 「閉じる」トグルが消えてしまうのを防ぐため、直近の判定を保持する。
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
    // 折り返し行数は要素幅に依存するため、リサイズに追従して再計測する
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [enabled, body]);

  return [ref, isClamped];
};

// 本文（要約優先・無ければ説明文）と「AIで要約」ボタンを表示する。
// 要約が無い記事だけボタンを出し、押すと生成→その場で表示に反映する。
// 本文が2行を超える場合は「続きを読む」で全文展開できる。
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
          {(isClamped || expanded) && (
            // カードを覆う overlay リンクより前面に出して、独立操作可能にする
            <button
              aria-controls={bodyId}
              aria-expanded={expanded}
              className="text-fg-mute hover:text-fg-base relative z-10 cursor-pointer self-start text-xs underline underline-offset-2"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setExpanded((prev) => !prev);
              }}
              type="button"
            >
              {expanded ? '閉じる' : '続きを読む'}
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
