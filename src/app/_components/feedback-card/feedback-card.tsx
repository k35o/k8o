'use client';

import { FEEDBACK_OPTIONS } from '@/app/_services/feedback';
import { Card } from '@/components/card';
import * as motion from 'motion/react-client';
import { FC } from 'react';

export const FeedbackCard: FC<{
  title: string;
  onSubmit: (feedback: number) => void;
}> = ({ title, onSubmit }) => {
  return (
    <Card title={title} width="fit" variant="secondary">
      <div className="grid grid-cols-4 gap-4 p-6">
        {FEEDBACK_OPTIONS.map((option) => {
          const Icon = option.icon;
          return (
            <motion.button
              key={option.id}
              type="button"
              className="bg-primary-bg-subtle text-primary-fg flex aspect-square flex-col items-center gap-2 rounded-lg p-4"
              onClick={() => {
                onSubmit(option.id);
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Icon size="lg" />
              <span className="text-sm">{option.label}</span>
            </motion.button>
          );
        })}
      </div>
    </Card>
  );
};
