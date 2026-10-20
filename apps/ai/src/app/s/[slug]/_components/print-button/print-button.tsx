'use client';

import { Button } from '@k8ordo/ui';
import type { FC } from 'react';

export const PrintButton: FC = () => (
  <Button
    color="base"
    onClick={() => {
      window.print();
    }}
    size="sm"
    variant="outline"
  >
    PDF出力
  </Button>
);
