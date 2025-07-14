'use client';

import { FeedbackCard } from '@/app/_components/feedback-card';
import { useToast } from '@/components/toast';
import { feedback } from '@/services/blogs/action';
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
