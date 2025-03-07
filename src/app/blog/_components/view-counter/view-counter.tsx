import { getBlogView } from '#actions/blog';
import { commalize } from '@/utils/number/commalize';
import { FC } from 'react';

export const ViewCounter: FC<{ blogId: number }> = async ({
  blogId,
}) => {
  const views = await getBlogView({ blogId });
  return <span>{commalize(views)}</span>;
};
