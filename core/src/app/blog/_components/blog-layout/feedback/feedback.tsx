'use client';

import { useToast } from '@k8o/arte-odyssey/toast';
import type { FC } from 'react';
import { FeedbackCard } from '@/app/_components/feedback-card';
import { feedback } from '@/services/blogs/action';

export const Feedback: FC<{
  slug: string;
}> = ({ slug }) => {
  const { onOpen } = useToast();
  return (
    <FeedbackCard
      onSubmit={async (id, comment) => {
        const result = await feedback(slug, id, comment);
        if (result.success) {
          onOpen('success', 'フィードバックを送信しました！');
        } else {
          onOpen('error', result.message);
        }
      }}
      title="この記事はどうでしたか？"
    />
  );
};
