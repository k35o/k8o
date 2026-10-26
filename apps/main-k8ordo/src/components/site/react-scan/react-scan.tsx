'use client';

import { useEffect } from 'react';
import type { FC } from 'react';
import { scan } from 'react-scan';

export const ReactScan: FC = () => {
  useEffect(() => {
    scan({
      enabled: false,
      showToolbar: true,
    });
  }, []);

  return null;
};
