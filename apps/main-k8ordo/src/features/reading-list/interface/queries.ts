import type { InferResponseType } from 'hono/client';

import type { publicApi } from '@/shared/api/public-api';
import { memoizeInBuild } from '@/shared/cache/memoize-in-build';

import { getArticleSources, getArticles } from '../application/reading-list';

// ビルド時の値はブラウザで api の GET の値に差し替えるので、型を api の応答にそろえ、
// 形がずれたら型検査で止める
export type ReadingList = InferResponseType<
  (typeof publicApi)['public']['reading-list']['$get'],
  200
>;

export const getReadingList = memoizeInBuild(async (): Promise<ReadingList> => {
  const [articles, sources] = await Promise.all([
    getArticles(),
    getArticleSources(),
  ]);
  return { articles, sources };
});
