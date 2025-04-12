'use client';

import { FeedbackCard } from '@/app/_components/feedback-card';
import { feedback } from '@/app/blog/_services/action';
import { useToast } from '@/components/toast';
import { FC } from 'react';

export const Feedback: FC<{
  slug: string;
}> = ({ slug }) => {
  const { onOpen } = useToast();
  return (
    <div className="flex items-center justify-center">
      <FeedbackCard
        title="この記事はどうでしたか？"
        onSubmit={async (id) => {
          const result = await feedback(slug, id);
          if (result.success) {
            onOpen('success', 'フィードバックを送信しました！');
          } else {
            onOpen('error', result.message);
          }
        }}
      />
    </div>
  );
};
