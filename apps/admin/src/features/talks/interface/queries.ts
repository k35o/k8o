import { cacheLife } from 'next/cache';

import {
  findBlogOptions,
  findTalkForEdit,
  findTalks,
} from '../infrastructure/talk-repository';
import type { BlogOption, TalkRecord } from '../infrastructure/talk-repository';

export const getTalks = async (): Promise<TalkRecord[]> => {
  'use cache';
  cacheLife('minutes');

  const result = await findTalks();
  return result;
};

export const getBlogOptions = async (): Promise<BlogOption[]> => {
  'use cache';
  cacheLife('minutes');

  const result = await findBlogOptions();
  return result;
};

export const getTalkForEdit = async (id: string) => {
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) {
    return null;
  }

  const talk = await findTalkForEdit(numericId);
  return talk;
};

export type { BlogOption, TalkRecord } from '../infrastructure/talk-repository';
