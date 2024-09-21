import { FC } from 'react';
import { kv } from '#vercel/kv';
import { commalize } from '@/utils/number/commalize';
import { Slug } from '../../_types';

export const ViewCounter: FC<{ slug: Slug }> = async ({ slug }) => {
  const views = await kv.incr(`views-${slug}`);
  return <span>{commalize(views)}</span>;
};
