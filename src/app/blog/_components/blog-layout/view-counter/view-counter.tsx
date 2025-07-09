import { getBlogView } from '#api/blog';
import { commalize } from '@k8o/helpers/number';
import { FC } from 'react';

export const ViewCounter: FC<{ id: number }> = async ({ id }) => {
  const views = await getBlogView(id);
  return <span>{commalize(views)}</span>;
};
