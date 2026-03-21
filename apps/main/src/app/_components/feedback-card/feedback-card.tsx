'use client';

import {
  BadIcon,
  Button,
  FormControl,
  GoodIcon,
  Textarea,
} from '@k8o/arte-odyssey';
import { cn } from '@repo/helpers/cn';
import {
  type FC,
  type KeyboardEvent,
  useRef,
  useState,
  useTransition,
} from 'react';

const OPTIONS = [
  { id: 1, label: '良い', icon: GoodIcon },
  { id: 2, label: '悪い', icon: BadIcon },
] as const;

export const FeedbackCard: FC<{
  title: string;
  onSubmit: (feedback: number | null, comment: string) => Promise<void>;
}> = ({ title, onSubmit }) => {
  const [feedbackId, setFeedbackId] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const isInvalidComment = comment.length > 500;
  const isDisabled = !(feedbackId || comment) || isInvalidComment || isPending;

  const handleKeyDown = (e: KeyboardEvent, index: number): void => {
    let next: number | null = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      next = (index + 1) % OPTIONS.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      next = (index - 1 + OPTIONS.length) % OPTIONS.length;
    }
    if (next === null) return;
    e.preventDefault();
    const option = OPTIONS[next];
    if (option) setFeedbackId(option.id);
    buttonRefs.current[next]?.focus();
  };

  const focusIndex =
    feedbackId !== null ? OPTIONS.findIndex((o) => o.id === feedbackId) : 0;

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <p className="font-bold text-fg-base text-lg">
          フィードバックありがとうございます！
        </p>
        <p className="text-fg-mute text-sm">記事の改善に役立てます。</p>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          await onSubmit(feedbackId, comment);
          setIsSubmitted(true);
        });
      }}
    >
      <div className="flex flex-col gap-1">
        <p className="font-bold text-fg-base text-xl">{title}</p>
        <p className="text-fg-mute text-sm">
          リアクションかコメントどちらかで送信できます
        </p>
      </div>
      <FormControl
        label="リアクション"
        renderInput={({ labelId: _ }) => (
          <div aria-required="false" className="flex gap-2" role="radiogroup">
            {OPTIONS.map((option, index) => {
              const Icon = option.icon;
              const isSelected = feedbackId === option.id;
              return (
                // biome-ignore lint/a11y/useSemanticElements: カスタムスタイルのラジオボタンとして使用
                <button
                  aria-checked={isSelected}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border border-border-base px-4 py-2 text-fg-mute transition-colors duration-150',
                    'hover:border-primary-border hover:text-primary-fg',
                    'aria-checked:border-primary-border aria-checked:text-primary-fg',
                  )}
                  key={option.id}
                  onClick={() => {
                    setFeedbackId(isSelected ? null : option.id);
                  }}
                  onKeyDown={(e) => {
                    handleKeyDown(e, index);
                  }}
                  ref={(el) => {
                    buttonRefs.current[index] = el;
                  }}
                  role="radio"
                  tabIndex={index === focusIndex ? 0 : -1}
                  type="button"
                >
                  <Icon size="md" />
                  <span className="text-sm">{option.label}</span>
                </button>
              );
            })}
          </div>
        )}
      />
      <FormControl
        errorText={isInvalidComment ? '500文字以内でご記入ください' : undefined}
        helpText="執筆のモチベーションや記事の修正・改善に活用します"
        isInvalid={isInvalidComment}
        label="コメント"
        renderInput={({ labelId: _, ...props }) => (
          <Textarea
            {...props}
            onChange={(e) => {
              setComment(e.target.value);
            }}
            value={comment}
          />
        )}
      />
      <Button disabled={isDisabled} type="submit">
        送信
      </Button>
    </form>
  );
};
