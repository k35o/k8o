import { getBlogView } from '@/app/blog/_api';
import { commalize } from '@k8o/helpers/number';
import { FC } from 'react';

export const ViewCounter: FC<{ id: number }> = async ({ id }) => {
  const views = await getBlogView(id);
  return <span>{commalize(views)}</span>;
};
