import { Button } from '@k8o/arte-odyssey/button';
import { FormControl } from '@k8o/arte-odyssey/form/form-control';
import { Textarea } from '@k8o/arte-odyssey/form/textarea';
import { cn } from '@k8o/helpers/cn';
import * as motion from 'motion/react-client';
import { type FC, useState } from 'react';
import { FEEDBACK_OPTIONS } from '@/services/feedbacks';

export const FeedbackCard: FC<{
  title: string;
  onSubmit: (feedback: number | null, comment: string) => Promise<void>;
}> = ({ title, onSubmit }) => {
  const [feedbackId, setFeedbackId] = useState<number | null>(null);
  const [comment, setComment] = useState<string>('');
  const [isPending, setIsPending] = useState(false);
  const isInvalidComment = comment.length > 500;

  const isDisabled = !(feedbackId || comment) || isInvalidComment || isPending;

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
      <p className="font-bold text-xl">{title}</p>
      <div
        aria-required="false"
        className="grid grid-cols-2 gap-4 sm:grid-cols-4"
        role="radiogroup"
      >
        {FEEDBACK_OPTIONS.map((option) => {
          const Icon = option.icon;
          return (
            <div className="flex items-center justify-center" key={option.id}>
              {/** biome-ignore lint/a11y/useSemanticElements: buttonとして表現したいため */}
              <motion.button
                aria-checked={feedbackId === option.id}
                className={cn(
                  'flex w-full max-w-28 flex-col items-center justify-center gap-2 rounded-lg bg-primary-bg-subtle p-3 text-primary-fg',
                  'aria-selected:border-2 aria-selected:border-primary-border aria-selected:bg-primary-bg aria-selected:text-fg-base',
                )}
                onClick={() => {
                  if (feedbackId === option.id) {
                    setFeedbackId(null);
                    return;
                  }
                  setFeedbackId(option.id);
                }}
                role="radio"
                type="button"
                value={option.id}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Icon />
                <span className="text-xs sm:text-sm">{option.label}</span>
              </motion.button>
            </div>
          );
        })}
      </div>
      <FormControl
        errorText={isInvalidComment ? '500文字以内でご記入ください' : undefined}
        helpText="500文字以内でご記入ください"
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
