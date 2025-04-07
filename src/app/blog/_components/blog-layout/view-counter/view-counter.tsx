import { getBlogView } from '#services/blog';
import { commalize } from '@/utils/number/commalize';
import { FC } from 'react';

export const ViewCounter: FC<{ slug: string }> = async ({ slug }) => {
  const views = await getBlogView(slug);
  return <span>{commalize(views)}</span>;
};
