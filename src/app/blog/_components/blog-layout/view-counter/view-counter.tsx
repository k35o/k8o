import { getBlogView } from '#api/blog';
import { commalize } from '@/helpers/number/commalize';
import { FC } from 'react';

export const ViewCounter: FC<{ id: number }> = async ({ id }) => {
  const views = await getBlogView(id);
  return <span>{commalize(views)}</span>;
};
