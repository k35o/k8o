'use client';

import { FC, useEffect } from 'react';
import { scan } from 'react-scan';

export const ReactScan: FC = () => {
  useEffect(() => {
    scan({
      enabled: false,
      showToolbar: true,
    });
  }, []);

  return <></>;
};
