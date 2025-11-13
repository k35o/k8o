'use client';

import { IconButton } from '@k8o/arte-odyssey/icon-button';
import { MailIcon } from '@k8o/arte-odyssey/icons';
import { Tooltip } from '@k8o/arte-odyssey/tooltip';
import type { FC } from 'react';

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
