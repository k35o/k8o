'use client';

import { IconButton, MailIcon, Tooltip } from '@k8o/arte-odyssey';
import type { FC } from 'react';

export const EmailTooltip: FC = () => (
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
