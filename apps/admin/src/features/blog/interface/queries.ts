import { cacheLife, cacheTag } from 'next/cache';

import {
  BLOGS_CACHE_TAG,
  COMMENTS_CACHE_TAG,
  TAGS_CACHE_TAG,
} from '@/shared/cache/cache-tags';

import {
  findBlogs,
  findTopViewedBlogs,
} from '../infrastructure/blog-repository';
import type {
  FindBlogsParams,
  FindBlogsResult,
  TopBlog,
} from '../infrastructure/blog-repository';

export const getBlogs = async (
  params: FindBlogsParams,
): Promise<FindBlogsResult> => {
  'use cache';
  cacheLife('minutes');
  // タグ名とコメント数を埋め込むため、それらの変更でも無効化する
  cacheTag(BLOGS_CACHE_TAG, TAGS_CACHE_TAG, COMMENTS_CACHE_TAG);

  const result = await findBlogs(params);
  return result;
};

export const getTopViewedBlogs = async (limit = 5): Promise<TopBlog[]> => {
  'use cache';
  cacheLife('minutes');
  cacheTag(BLOGS_CACHE_TAG);

  const result = await findTopViewedBlogs(limit);
  return result;
};

export type {
  BlogRecord,
  BlogSort,
  BlogStatus,
  FindBlogsParams,
  TopBlog,
} from '../infrastructure/blog-repository';
