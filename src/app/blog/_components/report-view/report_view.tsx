'use client';

import { FC, useEffect } from 'react';

export const ReportView: FC<{ blogId: number }> = ({ blogId }) => {
  useEffect(() => {
    fetch('/api/blog/views', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ blogId }),
    });
  }, [blogId]);

  return null;
};
