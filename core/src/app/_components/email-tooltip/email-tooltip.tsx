'use client';

import { IconButton } from '@k8o/components/icon-button';
import { MailIcon } from '@k8o/components/icons';
import { Tooltip } from '@k8o/components/tooltip';
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
