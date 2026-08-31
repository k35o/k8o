'use client';

import { useToast } from '@k8ordo/ui';
import type { FC } from 'react';

import { FeedbackCard } from '@/app/_components/feedback-card';
import { feedback } from '@/features/blog/interface/actions';

export const Feedback: FC<{
  slug: string;
}> = ({ slug }) => {
  const { open } = useToast();
  return (
    <FeedbackCard
      onSubmit={async (id, comment) => {
        const result = await feedback(slug, id, comment);
        if (result.success) {
          open('success', 'フィードバックを送信しました！');
        } else {
          open('error', result.message);
        }
        return result.success;
      }}
      title="この記事はどうでしたか？"
    />
  );
};
