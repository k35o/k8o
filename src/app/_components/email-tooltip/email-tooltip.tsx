'use client';

import { IconButton } from '@/components/icon-button';
import { MailIcon } from '@/components/icons';
import { Tooltip } from '@/components/tooltip';
import { FC } from 'react';

export const EmailTooltip: FC = () => {
  return (
    <Tooltip.Root placement="top">
      <Tooltip.Trigger
        renderItem={(props) => (
          <IconButton {...props} label="メールアドレスを確認">
            <MailIcon />
          </IconButton>
        )}
      />
      <Tooltip.Content>
        <p>k8o@k8o.me</p>
      </Tooltip.Content>
    </Tooltip.Root>
  );
};
