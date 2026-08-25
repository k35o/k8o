import { cacheLife, cacheTag } from 'next/cache';

import {
  BLOGS_CACHE_TAG,
  TAGS_CACHE_TAG,
  TALKS_CACHE_TAG,
} from '@/shared/cache/cache-tags';

import {
  findBlogOptions,
  findTalkForEdit,
  findTalks,
} from '../infrastructure/talk-repository';
import type { BlogOption, TalkRecord } from '../infrastructure/talk-repository';

export const getTalks = async (): Promise<TalkRecord[]> => {
  'use cache';
  cacheLife('minutes');
  // タグ名を埋め込むため、タグの変更でも無効化する
  cacheTag(TALKS_CACHE_TAG, TAGS_CACHE_TAG);

  const result = await findTalks();
  return result;
};

export const getBlogOptions = async (): Promise<BlogOption[]> => {
  'use cache';
  cacheLife('minutes');
  cacheTag(BLOGS_CACHE_TAG);

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
