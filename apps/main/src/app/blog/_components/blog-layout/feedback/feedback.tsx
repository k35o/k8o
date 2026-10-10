'use client';

import { useToast } from '@k8ordo/ui';
import type { FC } from 'react';

import { FeedbackCard } from '@/app/_components/feedback-card';
import { publicApi } from '@/shared/api/public-api';

const FAILED_MESSAGE =
  'フィードバックの送信に失敗しました。しばらくしてから再度お試しください。';

export const Feedback: FC<{
  slug: string;
}> = ({ slug }) => {
  const { open } = useToast();
  return (
    <FeedbackCard
      onSubmit={async (feedbackId, comment) => {
        try {
          const res = await publicApi.public.blogs[':slug'].feedback.$post({
            param: { slug },
            json: { feedbackId, comment },
          });
          if (res.ok) {
            open('success', 'フィードバックを送信しました！');
            return true;
          }
          open(
            'error',
            res.status === 404
              ? '指定されたブログが見つかりません'
              : FAILED_MESSAGE,
          );
        } catch {
          open('error', FAILED_MESSAGE);
        }
        return false;
      }}
      title="この記事はどうでしたか？"
    />
  );
};
