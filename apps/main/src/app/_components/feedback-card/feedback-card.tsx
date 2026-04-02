'use client';

import { BadIcon, Button, GoodIcon, Textarea } from '@k8o/arte-odyssey';
import { cn } from '@repo/helpers/cn';
import { type FC, useState, useTransition } from 'react';

const FEEDBACK_MAP: Record<string, number> = {
  good: 1,
  bad: 2,
};

export const FeedbackCard: FC<{
  title: string;
  onSubmit: (feedback: number | null, comment: string) => Promise<void>;
}> = ({ title, onSubmit }) => {
  const [feedbackValue, setFeedbackValue] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState(true);
  const [isPending, startTransition] = useTransition();

  const isInvalidComment = comment.length > 500;

  const handleSubmit = (value: string, commentText: string) => {
    startTransition(async () => {
      await onSubmit(FEEDBACK_MAP[value] ?? null, commentText);
      setIsSubmitted(true);
    });
  };

  const handleReaction = (value: string) => {
    setFeedbackValue(value);
    if (!isCommentOpen) {
      handleSubmit(value, '');
    }
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
        <div className="flex items-center gap-2">
          <button
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors',
              feedbackValue === 'good'
                ? 'bg-primary-bg text-primary-fg'
                : 'bg-bg-mute text-fg-mute hover:bg-bg-emphasize hover:text-fg-base',
            )}
            disabled={isPending}
            onClick={() => handleReaction('good')}
            type="button"
          >
            <GoodIcon size="sm" />
            良い
          </button>
          <button
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors',
              feedbackValue === 'bad'
                ? 'bg-primary-bg text-primary-fg'
                : 'bg-bg-mute text-fg-mute hover:bg-bg-emphasize hover:text-fg-base',
            )}
            disabled={isPending}
            onClick={() => handleReaction('bad')}
            type="button"
          >
            <BadIcon size="sm" />
            悪い
          </button>
          {!isCommentOpen && (
            <button
              className="rounded-full px-3 py-1.5 text-fg-mute text-sm transition-colors hover:bg-bg-mute hover:text-fg-base"
              onClick={() => setIsCommentOpen(true)}
              type="button"
            >
              コメント
            </button>
          )}
        </div>
      </div>
      {isCommentOpen && (
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
      )}
    </div>
  );
};
