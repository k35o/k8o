import { FEEDBACK_OPTIONS } from '@/services/feedbacks';
import { Button } from '@k8o/arte-odyssey/button';
import { FormControl } from '@k8o/arte-odyssey/form/form-control';
import { Textarea } from '@k8o/arte-odyssey/form/textarea';
import { cn } from '@k8o/helpers/cn';
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
  const [isPending, setIsPending] = useState(false);
  const isInvalidComment = comment.length > 500;

  const isDisabled =
    (!feedbackId && !comment) || isInvalidComment || isPending;

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        setIsPending(true);
        void onSubmit(feedbackId, comment).then(() => {
          setIsPending(false);
          setComment('');
          setFeedbackId(null);
        });
      }}
    >
      <p className="text-xl font-bold">{title}</p>
      <div
        role="radiogroup"
        aria-required="false"
        className="grid grid-cols-2 gap-4 sm:grid-cols-4"
      >
        {FEEDBACK_OPTIONS.map((option) => {
          const Icon = option.icon;
          return (
            <div
              key={option.id}
              className="flex items-center justify-center"
            >
              <motion.button
                type="button"
                role="radio"
                className={cn(
                  'bg-primary-bg-subtle text-primary-fg flex w-full max-w-28 flex-col items-center justify-center gap-2 rounded-lg p-3',
                  'aria-selected:text-fg-base aria-selected:bg-primary-bg aria-selected:border-primary-border aria-selected:border-2',
                )}
                aria-checked={feedbackId === option.id}
                value={option.id}
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
            </div>
          );
        })}
      </div>
      <FormControl
        label="コメント"
        helpText="500文字以内でご記入ください"
        errorText={
          isInvalidComment ? '500文字以内でご記入ください' : undefined
        }
        isInvalid={isInvalidComment}
        renderInput={({ labelId: _, ...props }) => (
          <Textarea
            {...props}
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
            }}
          />
        )}
      />
      <Button type="submit" disabled={isDisabled}>
        送信
      </Button>
    </form>
  );
};
