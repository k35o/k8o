import { getTalks as _getTalks } from '@repo/api/build-data';

import { memoizeInBuild } from '@/shared/cache/memoize-in-build';

export const getTalks = memoizeInBuild(_getTalks);
