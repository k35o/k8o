'use client';

import { FEEDBACK_OPTIONS } from '@/app/_services/feedback';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { FormControl } from '@/components/form/form-control';
import { Textarea } from '@/components/form/textarea';
import { cn } from '@/utils/cn';
import * as motion from 'motion/react-client';
import { FC, useState } from 'react';

export const FeedbackCard: FC<{
  title: string;
  onSubmit: (
    feedback: number | null,
    comment: string,
  ) => Promise<void>;
}> = ({ title, onSubmit }) => {
  const [feedbackId, setFeedbackId] = useState<number | null>(null);
  const [comment, setComment] = useState<string>('');
  const isInvalidComment = comment.length > 500;
  return (
    <Card title={title} width="fit" variant="secondary">
      <form
        className="flex flex-col gap-6 p-6"
        onSubmit={() => {
          void onSubmit(feedbackId, comment);
        }}
      >
        <div className="grid grid-cols-2 justify-items-center gap-4 sm:grid-cols-4">
          {FEEDBACK_OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <motion.button
                key={option.id}
                type="button"
                className={cn(
                  'bg-primary-bg-subtle text-primary-fg flex aspect-square flex-col items-center justify-center gap-2 rounded-lg p-3',
                  'aria-selected:text-fg-base aria-selected:bg-primary-bg',
                )}
                aria-selected={feedbackId === option.id}
                onClick={() => {
                  if (feedbackId === option.id) {
                    setFeedbackId(null);
                    return;
                  }
                  setFeedbackId(option.id);
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Icon />
                <span className="text-xs sm:text-sm">
                  {option.label}
                </span>
              </motion.button>
            );
          })}
        </div>
        <FormControl
          label="コメント"
          helpText="500文字以内でご記入ください"
          errorText={
            isInvalidComment
              ? '500文字以内でご記入ください'
              : undefined
          }
          isInvalid={isInvalidComment}
          renderInput={(props) => (
            <Textarea
              {...props}
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
              }}
            />
          )}
        />
        <Button type="submit" disabled={!feedbackId && !comment}>
          送信
        </Button>
      </form>
    </Card>
  );
};
