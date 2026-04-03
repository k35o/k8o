'use client';

import { BadIcon, Button, GoodIcon, Textarea } from '@k8o/arte-odyssey';
import { cn } from '@repo/helpers/cn';
import { type FC, useState, useTransition } from 'react';

const FEEDBACK_MAP: Record<string, number> = {
  good: 1,
  bad: 2,
};

const pillClass = (key: string, feedbackValue: string): string =>
  cn(
    'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors',
    'disabled:cursor-not-allowed disabled:opacity-50',
    feedbackValue === key
      ? 'bg-primary-bg text-primary-fg'
      : 'bg-bg-mute text-fg-mute hover:bg-bg-emphasize hover:text-fg-base',
  );

export const FeedbackCard: FC<{
  title: string;
  onSubmit: (feedback: number | null, comment: string) => Promise<void>;
}> = ({ title, onSubmit }) => {
  const [feedbackValue, setFeedbackValue] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isInvalidComment = comment.length > 500;

  const handleSubmit = (value: string, commentText: string) => {
    startTransition(async () => {
      await onSubmit(FEEDBACK_MAP[value] ?? null, commentText);
      setIsSubmitted(true);
    });
  };

  const toggleFeedback = (key: string) => {
    setFeedbackValue((prev) => (prev === key ? '' : key));
  };

  if (isSubmitted) {
    return (
      <p className="py-4 text-center text-fg-mute text-sm">
        フィードバックありがとうございます！
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-fg-mute text-sm">{title}</p>
        <fieldset
          aria-label="フィードバック"
          className="flex items-center gap-2 border-none p-0"
        >
          <button
            aria-pressed={feedbackValue === 'good'}
            className={pillClass('good', feedbackValue)}
            disabled={isPending}
            onClick={() => toggleFeedback('good')}
            type="button"
          >
            <GoodIcon size="sm" />
            良い
          </button>
          <button
            aria-pressed={feedbackValue === 'bad'}
            className={pillClass('bad', feedbackValue)}
            disabled={isPending}
            onClick={() => toggleFeedback('bad')}
            type="button"
          >
            <BadIcon size="sm" />
            悪い
          </button>
        </fieldset>
      </div>
      <div className="flex flex-col gap-3">
        <Textarea
          describedbyId={undefined}
          id="feedback-comment"
          isDisabled={isPending}
          isInvalid={isInvalidComment}
          isRequired={false}
          onChange={(e) => setComment(e.target.value)}
          placeholder="ひとことあれば…"
          rows={2}
          value={comment}
        />
        {isInvalidComment && (
          <p className="text-fg-error text-xs">500文字以内でご記入ください</p>
        )}
        <div className="flex justify-end">
          <Button
            disabled={
              !(feedbackValue || comment) || isInvalidComment || isPending
            }
            onClick={() => handleSubmit(feedbackValue, comment)}
            size="sm"
          >
            送信
          </Button>
        </div>
      </div>
    </div>
  );
};
