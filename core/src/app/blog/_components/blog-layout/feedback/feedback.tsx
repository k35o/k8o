'use client';

import { FeedbackCard } from '@/app/_components/feedback-card';
import { feedback } from '@/services/blogs/action';
import { useToast } from '@k8o/arte-odyssey/toast';
import { FC } from 'react';

export const Feedback: FC<{
  slug: string;
}> = ({ slug }) => {
  const { onOpen } = useToast();
  return (
    <FeedbackCard
      title="この記事はどうでしたか？"
      onSubmit={async (id, comment) => {
        const result = await feedback(slug, id, comment);
        if (result.success) {
          onOpen('success', 'フィードバックを送信しました！');
        } else {
          onOpen('error', result.message);
        }
      }}
    />
  );
};
