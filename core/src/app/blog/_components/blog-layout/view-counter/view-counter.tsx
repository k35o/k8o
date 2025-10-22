import { commalize } from '@k8o/helpers/number';
import type { FC } from 'react';
import { getBlogView } from '@/app/blog/_api';

export const ViewCounter: FC<{ id: number }> = async ({ id }) => {
  const views = await getBlogView(id);
  return <span>{commalize(views)}</span>;
};
