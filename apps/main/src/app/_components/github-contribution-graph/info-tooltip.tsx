'use client';

import { AlertIcon, IconButton, Tooltip } from '@k8o/arte-odyssey';
import type { FC } from 'react';

export const InfoTooltip: FC = () => (
  <Tooltip.Root placement="top">
    <Tooltip.Trigger
      renderItem={(props) => (
        <IconButton
          {...props}
          label="このグラフについて"
          size="sm"
          tooltipDisabled
        >
          <AlertIcon size="sm" status="info" />
        </IconButton>
      )}
    />
    <Tooltip.Content>
      GitHub上のコントリビューション履歴（commit / PR / issue / review）
    </Tooltip.Content>
  </Tooltip.Root>
);
