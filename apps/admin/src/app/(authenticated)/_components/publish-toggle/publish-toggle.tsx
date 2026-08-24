'use client';

import { Switch, useToast } from '@k8o/arte-odyssey';
import { useOptimistic, useTransition } from 'react';
import type { FC } from 'react';

import type { ActionState } from '@/shared/actions/action-state';

type PublishToggleProps = {
  published: boolean;
  onToggle: (next: boolean) => Promise<ActionState>;
};

// 公開/下書きの楽観的トグル。失敗時は published prop の値へ自動で巻き戻る。
// blog / slide のテーブル行で共用。
export const PublishToggle: FC<PublishToggleProps> = ({
  published,
  onToggle,
}) => {
  const [optimisticPublished, setOptimisticPublished] =
    useOptimistic(published);
  const [isPending, startTransition] = useTransition();
  const { open } = useToast();

  const handleToggle = (checked: boolean): void => {
    startTransition(async () => {
      setOptimisticPublished(checked);
      let result: ActionState;
      try {
        result = await onToggle(checked);
      } catch {
        open('error', '処理に失敗しました。時間をおいて再度お試しください。');
        return;
      }
      if (result.error !== undefined) {
        open('error', result.error);
        return;
      }
      open('success', checked ? '公開しました' : '下書きに戻しました');
    });
  };

  return (
    <Switch
      disabled={isPending}
      label={optimisticPublished ? '公開' : '下書き'}
      onChange={handleToggle}
      checked={optimisticPublished}
    />
  );
};
