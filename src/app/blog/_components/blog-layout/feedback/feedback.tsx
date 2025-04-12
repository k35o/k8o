'use client';

import { FeedbackCard } from '@/app/_components/feedback-card';
import { FC } from 'react';

export const Feedback: FC = () => {
  return (
    <div className="flex items-center justify-center">
      <FeedbackCard
        title="この記事はどうでしたか？"
        onSubmit={(feedback) => {
          console.log('Feedback submitted:', feedback);
        }}
      />
    </div>
  );
};
