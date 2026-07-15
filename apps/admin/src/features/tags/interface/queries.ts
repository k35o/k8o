import { cacheLife } from 'next/cache';

import { findTagsWithUsage } from '../infrastructure/tag-repository';
import type { TagWithUsage } from '../infrastructure/tag-repository';

export const getTags = async (): Promise<TagWithUsage[]> => {
  'use cache';
  cacheLife('minutes');

  const result = await findTagsWithUsage();
  return result;
};

export type { TagWithUsage } from '../infrastructure/tag-repository';
