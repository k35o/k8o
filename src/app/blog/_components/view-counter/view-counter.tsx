import { FC } from 'react';
import { commalize } from '@/utils/number/commalize';
import { getBlogView } from '#actions/blog';

export const ViewCounter: FC<{ blogId: number }> = async ({
  blogId,
}) => {
  const views = await getBlogView({ blogId });
  return <span>{commalize(views)}</span>;
};
