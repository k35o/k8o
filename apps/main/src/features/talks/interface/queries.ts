import { getTalks as _getTalks } from '@/features/talks/application/talks';
import { memoizeInBuild } from '@/shared/cache/memoize-in-build';

export const getTalks = memoizeInBuild(_getTalks);
