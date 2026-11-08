import { notFound } from '@k8ordo/framework';
import { getTags as _getTags } from '@repo/api/build-data';

import { memoizeInBuild } from '@/shared/cache/memoize-in-build';

export const getTags = memoizeInBuild(_getTags);

export const getTag = async (id: number) => {
  const tag = (await getTags()).find((candidate) => candidate.id === id);
  if (tag === undefined) {
    notFound();
  }
  return tag;
};
