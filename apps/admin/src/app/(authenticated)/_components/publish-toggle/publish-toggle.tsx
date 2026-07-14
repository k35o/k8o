'use client';

import { Switch, useToast } from '@k8o/arte-odyssey';
import { useAsyncAction } from '@repo/react-hooks/use-async-action';
import { useState } from 'react';
import type { FC } from 'react';

import type { ActionState } from '@/shared/actions/action-state';

type PublishToggleProps = {
  initialPublished: boolean;
  onToggle: (next: boolean) => Promise<ActionState>;
};

// 公開/下書きの楽観的トグル。失敗時は元の状態へ戻す。blog / slide のテーブル行で共用。
export const PublishToggle: FC<PublishToggleProps> = ({
  initialPublished,
  onToggle,
}) => {
  const [published, setPublished] = useState(initialPublished);
  const { isPending, run } = useAsyncAction();
  const { onOpen } = useToast();

  const handleToggle = (checked: boolean): void => {
    const next = checked;
    setPublished(next);
    run(() => onToggle(next), {
      onError: (message) => {
        setPublished(!next);
        onOpen('error', message);
      },
      onSuccess: () => {
        onOpen('success', next ? '公開しました' : '下書きに戻しました');
      },
    });
  };

  return (
    <Switch
      disabled={isPending}
      label={published ? '公開' : '下書き'}
      onChange={handleToggle}
      value={published}
    />
  );
};
