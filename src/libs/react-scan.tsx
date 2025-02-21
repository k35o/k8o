'use client';

import { scan } from 'react-scan';
import { FC, useEffect } from 'react';

export const ReactScan: FC = () => {
  useEffect(() => {
    scan({
      enabled: false,
      showToolbar: true,
    });
  }, []);

  return <></>;
};
