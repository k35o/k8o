'use client';

import { IconButton } from '@/components/icon-button';
import { Tooltip } from '@/components/tooltip';
import { Mail } from 'lucide-react';
import { FC } from 'react';

export const EmailTooltip: FC = () => {
  return (
    <Tooltip.Root placement="top">
      <Tooltip.Trigger
        renderItem={(props) => (
          <IconButton {...props} label="メールアドレスを確認">
            <Mail className="size-5 md:size-6" />
          </IconButton>
        )}
      />
      <Tooltip.Content>
        <p>k8o@k8o.me</p>
      </Tooltip.Content>
    </Tooltip.Root>
  );
};
