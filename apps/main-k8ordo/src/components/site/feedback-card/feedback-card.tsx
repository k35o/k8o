'use client';

import { BadIcon, Button, GoodIcon, Textarea } from '@k8ordo/ui';
import { useId, useState, useTransition } from 'react';
import type { FC } from 'react';

import styles from './feedback-card.module.css';

const FEEDBACK_MAP = {
  good: 1,
  bad: 2,
} as const satisfies Record<string, number>;

export const FeedbackCard: FC<{
  title: string;
  onSubmit: (feedback: 1 | 2 | null, comment: string) => Promise<boolean>;
}> = ({ title, onSubmit }) => {
  const textareaId = useId();
  const errorId = useId();
  const [feedbackValue, setFeedbackValue] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isInvalidComment = comment.length > 500;

  const handleSubmit = () => {
    startTransition(async () => {
      const id =
        feedbackValue in FEEDBACK_MAP
          ? FEEDBACK_MAP[feedbackValue as keyof typeof FEEDBACK_MAP]
          : null;
      const isSuccess = await onSubmit(id, comment);
      if (isSuccess) {
        setIsSubmitted(true);
      }
    });
  };

  const toggleFeedback = (key: string) => {
    setFeedbackValue((prev) => (prev === key ? '' : key));
  };

  if (isSubmitted) {
    return (
      <p className={styles.thanks}>フィードバックありがとうございます！</p>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <p className={styles.title}>{title}</p>
        <fieldset aria-label="フィードバック" className={styles.choices}>
          <button
            aria-pressed={feedbackValue === 'good'}
            className={styles.pill}
            disabled={isPending}
            onClick={() => {
              toggleFeedback('good');
            }}
            type="button"
          >
            <GoodIcon size="sm" />
            良い
          </button>
          <button
            aria-pressed={feedbackValue === 'bad'}
            className={styles.pill}
            disabled={isPending}
            onClick={() => {
              toggleFeedback('bad');
            }}
            type="button"
          >
            <BadIcon size="sm" />
            悪い
          </button>
        </fieldset>
      </div>
      <div className={styles.body}>
        <label className={styles.srOnly} htmlFor={textareaId}>
          コメント
        </label>
        <Textarea
          aria-describedby={isInvalidComment ? errorId : undefined}
          disabled={isPending}
          id={textareaId}
          invalid={isInvalidComment}
          onChange={(e) => {
            setComment(e.target.value);
          }}
          placeholder="ひとことあれば…"
          rows={2}
          value={comment}
        />
        {isInvalidComment && (
          <p className={styles.error} id={errorId}>
            500文字以内でご記入ください
          </p>
        )}
        <div className={styles.actions}>
          <Button
            disabled={
              !(feedbackValue || comment) || isInvalidComment || isPending
            }
            onClick={handleSubmit}
            size="sm"
            type="button"
          >
            送信
          </Button>
        </div>
      </div>
    </div>
  );
};
