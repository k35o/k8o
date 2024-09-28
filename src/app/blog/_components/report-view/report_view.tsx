'use client';

import { incrementBlogView } from '#actions/blog';
import { FC, useEffect } from 'react';

export const ReportView: FC<{ blogId: number }> = ({ blogId }) => {
  useEffect(() => {
    incrementBlogView({ blogId });
  }, [blogId]);

  return null;
};
