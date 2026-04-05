'use client';

import { type FC, useEffect } from 'react';

export const ViewReporter: FC<{ slug: string }> = ({ slug }) => {
  useEffect(() => {
    void fetch('/api/blog/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    });
  }, [slug]);

  return null;
};
