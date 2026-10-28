import { notFound } from '@k8ordo/framework';

import { getTag as _getTag } from '@/features/tags/application/tag';
import { getTags as _getTags } from '@/features/tags/application/tags';
import { memoizeInBuild } from '@/shared/cache/memoize-in-build';

export const getTags = memoizeInBuild(_getTags);

const findTag = memoizeInBuild(_getTag);

export const getTag = async (id: number) => {
  const tag = await findTag(id);
  if (tag === null) {
    notFound();
  }
  return tag;
};
