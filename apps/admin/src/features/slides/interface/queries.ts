import { cacheLife } from 'next/cache';

import {
  findSlides,
  type SlideRecord,
} from '../infrastructure/slide-repository';

export const getSlides = async (): Promise<SlideRecord[]> => {
  'use cache';
  cacheLife('minutes');

  const result = await findSlides();
  return result;
};

export type { SlideRecord } from '../infrastructure/slide-repository';
