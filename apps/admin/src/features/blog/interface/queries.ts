import { cacheLife } from 'next/cache';

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

  const result = await findBlogs(params);
  return result;
};

export const getTopViewedBlogs = async (limit = 5): Promise<TopBlog[]> => {
  'use cache';
  cacheLife('minutes');

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
